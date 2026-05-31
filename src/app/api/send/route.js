import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        let emails, subject, message, links = [], attachments = [];
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            emails = formData.get("emails");
            subject = formData.get("subject");
            message = formData.get("message");

            const linksStr = formData.get("links");
            if (linksStr) {
                try {
                    links = JSON.parse(linksStr);
                } catch (e) {
                    // Ignore parsing error
                }
            }

            const files = formData.getAll("attachments");
            for (const file of files) {
                if (file && typeof file !== 'string' && file.name) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    attachments.push({
                        filename: file.name,
                        content: buffer,
                        contentType: file.type
                    });
                }
            }
        } else {
            const body = await request.json();
            emails = body.emails;
            subject = body.subject;
            message = body.message;
            links = body.links || [];
        }

        if (!emails || !subject || !message) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required"
                },
                {
                    status: 400
                }
            )
        }

        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            return NextResponse.json(
                {
                    success: false,
                    message: "SMTP credentials not configured"
                },
                {
                    status: 500
                }
            )
        }

        const emailList = emails.split(',').map(email => email.trim()).filter(email => email.length > 0)

        if (emailList.length == 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No valid email addresses provided"
                },
                {
                    status: 400
                }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        const invalidEmails = emailList.filter(email => !emailRegex.test(email))

        if (invalidEmails.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid email addresses: ${invalidEmails.join(', ')}`
                },
                {
                    status: 400
                }
            )
        }

        const transporter = nodemailer.createTransport(
            {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD
                }
            }
        )

        try {
            await transporter.verify();
        } catch (verifyError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email server configuration error. Please check your SMTP settings.'
                },
                {
                    status: 500
                }
            )
        }

        let formattedMessageText = message;
        let formattedMessageHtml = message.replace(/\n/g, '<br>');

        if (links && links.length > 0) {
            formattedMessageText += "\n\n> ASSOCIATED LINKS:\n" + links.map(l => `- ${l}`).join('\n');
            formattedMessageHtml += "<br><br><strong>&gt; ASSOCIATED LINKS:</strong><br>" + links.map(l => `- <a href="${l}" target="_blank" style="color: #00FF41; text-decoration: underline;">${l}</a>`).join('<br>');
        }

        const emailPromises = emailList.map(async (email) => {
            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: email,
                subject: subject,
                text: formattedMessageText,
                html: formattedMessageHtml,
                attachments: attachments
            };

            try {
                await transporter.sendMail(mailOptions);
                return {
                    email,
                    status: 'sent'
                };
            } catch (emailError) {
                return {
                    email,
                    status: 'failed',
                    error: emailError.message
                };
            }
        });

        const results = await Promise.all(emailPromises);

        const sentEmails = results.filter(r => r.status === 'sent')
        const failedEmails = results.filter(r => r.status === 'failed')

        if (failedEmails.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: `Successfully sent emails to ${sentEmails.length} recipient(s)`,
                    results: results
                },
                {
                    status: 200
                }
            );
        } else if (sentEmails.length > 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: `Sent to ${sentEmails.length} recipient(s), failed to send to ${failedEmails.length} recipient(s)`,
                    results: results
                },
                {
                    status: 200
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: `Failed to send emails to all ${failedEmails.length} recipient(s)`,
                    results: results
                },
                {
                    status: 500
                }
            );
        }

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred while processing your request',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            {
                status: 500
            }
        );
    }
}

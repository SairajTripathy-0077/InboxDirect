import { NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

function extractEmails(data) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails = []

    data.forEach((row)=>{
        Object.values(row).forEach((value)=>{
            if(typeof value == 'string' && emailRegex.test(value.trim())){
                emails.push(value.trim())
            }
        })
    })

    return emails
}

export async function POST(request){
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if(!file){
            return NextResponse.json(
                {
                    success: false,
                    message: 'No file uploaded.'
                },
                {
                    status: 400
                }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let emails = [];
        
        if(file.name.endsWith('.csv')){
            const csvtext = buffer.toString()
            const result = Papa.parse(csvtext,{
                header:true
            })

            emails = extractEmails(result.data)
        }else if(file.name.endsWith('.xlsx') || file.name.endsWith('.xls')){
            const spreadsheet = XLSX.read(buffer,{
                type:'buffer'
            })

            const sheetName = spreadsheet.SheetNames[0]
            
            const sheet = XLSX.utils.sheet_to_json(spreadsheet.Sheets[sheetName]);

            emails = extractEmails(sheet)
        }else{
            return NextResponse.json(
                {
                    success:false,
                    message:'Unsupported file format. Please upload a CSV or Excel file.'
                },
                {
                    status:400
                }
            )
        }

        emails = [...new Set(emails)]

        return NextResponse.json(
            {
                success:true,
                message:'File parsed successfully',
                emails
            },
            {
                status:200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                success:false,
                message:'Failed to process file.'
            },
            {
                status:500
            }
        )
    }
}
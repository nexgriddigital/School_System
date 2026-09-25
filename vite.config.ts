import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function transcriptAnalysisPlugin(): Plugin {
  return {
    name: 'transcript-analysis-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/analyze-transcript') && req.method === 'POST') {
          try {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const payload = JSON.parse(body);
            const { fileDataUrl, mimeType, fileName, enrollingGrade, prerequisiteGrade } = payload;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'GEMINI_API_KEY is not configured.' }));
              return;
            }

            const ai = new GoogleGenAI();
            const base64Data = fileDataUrl.includes('base64,') ? fileDataUrl.split('base64,')[1] : fileDataUrl;
            const detectedMime = mimeType || (fileDataUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg');
            const targetGrade = prerequisiteGrade || (enrollingGrade > 9 ? enrollingGrade - 1 : 9);

            const prompt = `You are an expert academic registrar specializing in Ethiopian secondary school transcripts (Grade 9, 10, 11, and 12) and Ministry of Education student credentials.
Analyze this academic transcript document (${fileName || 'Ethiopian Secondary School Transcript'}).
The candidate is enrolling into Grade ${enrollingGrade || 10}, so this transcript represents Grade ${targetGrade} or prior secondary school grades.

Ethiopian secondary schools record subjects such as:
- English Language
- Amharic / Mother Tongue (Afaan Oromoo, Tigrinya, etc.)
- Mathematics
- Physics
- Chemistry
- Biology
- Civics & Ethical Education / Citizenship
- History
- Geography
- Information & Communication Technology (ICT)
- Health & Physical Education (HPE)
- Economics / General Business (Social Science stream)
- Technical Drawing (Natural Science stream)

Extract:
1. Student Full Name (typically Ethiopian 3-part name: First Name, Father Name, Grandfather Name)
2. Gender ('Male', 'Female', or null)
3. School Name / Issuing secondary school
4. Grade Level analyzed (e.g. ${targetGrade})
5. Academic Year (e.g. "2015 E.C." or "2022/2023")
6. Every single taken course/subject with its Semester 1 score, Semester 2 score, final average mark, letter grade ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'), credit periods, and pass status.
7. Total average score / percentage across all subjects.
8. Overall letter grade.
9. Conduct rating (e.g. "Excellent (A)", "A", "Very Good (B)").
10. Promotion status (e.g. "PROMOTED TO GRADE ${enrollingGrade || 10}", "Passed").
11. Class rank if listed (e.g. "3rd / 54").
12. Summary registrar verification notes confirming validity and prerequisite compliance.

Return strictly a JSON object with this exact structure (do NOT wrap in markdown codeblocks):
{
  "studentNameFound": string,
  "gender": "Male" | "Female" | "Other" | null,
  "schoolNameFound": string,
  "gradeLevelAnalyzed": number,
  "academicYear": string,
  "totalAverageScore": number,
  "overallLetterGrade": string,
  "rankInClass": string | null,
  "conductRating": string | null,
  "promotionStatus": string,
  "summaryNotes": string,
  "courses": [
    {
      "subject": string,
      "gradeLevel": number,
      "semester1Score": number | null,
      "semester2Score": number | null,
      "finalAverage": number,
      "letterGrade": string,
      "creditsOrPeriods": number | null,
      "conduct": string | null,
      "remarks": string | null
    }
  ]
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType: detectedMime
                      }
                    }
                  ]
                }
              ]
            });

            const rawText = response.text || '';
            let cleaned = rawText.trim();
            if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
            }

            const parsed = JSON.parse(cleaned);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: parsed }));
          } catch (err: any) {
            console.error('Error analyzing transcript:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Failed to analyze transcript' }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), transcriptAnalysisPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

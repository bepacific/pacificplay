'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Define the data types
interface AirtableRecord {
  email: string;
  data: Record<string, string | number | boolean | null>;
}

export default function Home() {
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get("email") || "";
  const contentRef = useRef<HTMLDivElement>(null);

  // Define the query function
  const fetchAirtableData = async ({ queryKey }: { queryKey: string[] }) => {
    const [_key, email] = queryKey;
    const response = await axios.get(`/api/airtable?email=${email}`);
    return response.data as AirtableRecord[];
  };

  // Use the useQuery hook with the email parameter
  const { data, isLoading } = useQuery({
    queryKey: ['/api/airtable', email],
    queryFn: fetchAirtableData,
    enabled: !!email,
  });

  // Function to render formatted array values
  const renderFormattedValue = (value: any): React.ReactNode => {
    if (typeof value !== 'string') {
      return String(value);
    }

    try {
      // Check if it's a JSON array
      if (value.trim().startsWith('[') && value.trim().endsWith(']')) {
        const parsedValue = JSON.parse(value);
        if (Array.isArray(parsedValue)) {
          return (
            <ul className="list-disc pl-5 space-y-1">
              {parsedValue.map((item, idx) => (
                <li key={idx} className="text-sm">
                  {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </li>
              ))}
            </ul>
          );
        }
      }
    } catch (e) {
      // If parsing fails, just return the original string
    }
    
    return value;
  };

  // Function to download data as PDF
  const downloadAsPDF = async () => {
    if (!contentRef.current || !data) return;
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate how many pages we need
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = -pageHeight * (imgHeight - heightLeft) / imgHeight; // Calculate position for new page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`airtable_data_${email || 'export'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Airtable Data Viewer</CardTitle>
          {data && data.length > 0 && (
            <Button 
              onClick={downloadAsPDF} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Displaying data for {email || 'N/A'}
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-6" ref={contentRef}>
          {Object.entries(data[0].data).map(([key, value]) => {
            // Get friendly title for specific keys
            let displayTitle = key;
            if (key === "marketing") {
              displayTitle = "Your recommended marketing applications:";
            } else if (key === "operations") {
              displayTitle = "Your recommended operations applications:";
            } else if (key === "finance") {
              displayTitle = "Your recommended finance applications:";
            } else if (key === "development") {
              displayTitle = "Your recommended development applications:";
            } else if (key === "support") {
              displayTitle = "Your recommended support applications:";
            }
            
            return (
              <Card key={key}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base font-medium">{displayTitle}</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  {renderFormattedValue(value)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No records found
          </CardContent>
        </Card>
      )}
    </div>
  );
}

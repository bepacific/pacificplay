'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Define the data types
interface AirtableRecord {
  email: string;
  data: Record<string, string | number | boolean | null>;
}

export default function Home() {
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get("email") || "";

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

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Airtable Data Viewer</CardTitle>
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
        <div className="space-y-6">
          {Object.entries(data[0].data).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="py-3">
                <CardTitle className="text-base font-medium">{key}</CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                {renderFormattedValue(value)}
              </CardContent>
            </Card>
          ))}
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

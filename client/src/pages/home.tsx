import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { recordSchema, type AirtableData } from "@shared/schema";

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/airtable"],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Airtable Data Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Displaying all data
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : data && data.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0].data).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record, index) => (
                  <TableRow key={index}>
                    {Object.values(record.data).map((value, i) => (
                      <TableCell key={i}>
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
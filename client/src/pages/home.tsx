import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { recordSchema, type AirtableData } from "@shared/schema";

const filterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FilterFormData = z.infer<typeof filterSchema>;

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      email: "",
    },
  });

  const { data, isLoading, error } = useQuery<AirtableData[]>({
    queryKey: ["/api/airtable", email],
    enabled: Boolean(email),
  });

  const onSubmit = (values: FilterFormData) => {
    setEmail(values.email);
  };

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to fetch Airtable data. Please try again.",
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Airtable Data Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Filter</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Filter Data</Button>
            </form>
          </Form>
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
      ) : email ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No records found for this email
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStateStats } from "@/lib/apiClient";
import { toast } from "sonner";

const StateStatsManagement = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await getStateStats();
        setStats(data || []);
      } catch (error) {
        toast.error("Failed to load state statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>State-wise Statistics</CardTitle>
        <CardDescription>
          Aggregated COVID-19 statistics for each state and union territory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Confirmed</TableHead>
                <TableHead className="text-right text-yellow-500">Active</TableHead>
                <TableHead className="text-right text-green-500">Recovered</TableHead>
                <TableHead className="text-right text-red-500">Deaths</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No state statistics found.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((stateStat) => (
                  <TableRow key={stateStat.State}>
                    <TableCell className="font-medium">{stateStat.State}</TableCell>
                    <TableCell className="text-right">{stateStat.Confirmed.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-yellow-500">{stateStat.Active.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-500">{stateStat.Recovered.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-500">{stateStat.Deaths.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StateStatsManagement;
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPredictionStates, getPredictions } from "@/lib/apiClient";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PredictionsView = () => {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const data = await getPredictionStates();
        setStates(data || []);
        if (data && data.length > 0) {
          setSelectedState(data[0]);
        }
      } catch (error) {
        toast.error("Failed to load states for prediction.");
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const loadStateData = async () => {
        setIsLoading(true);
        try {
          const data = await getPredictions(selectedState);
          if (data && data.confirmed) {
            // The backend returns separate arrays, so we need to combine them
            // for the chart.
            const formattedData = data.confirmed.map((value: number, index: number) => ({
              date: `Day ${index + 1}`,
              confirmed: value,
              recovered: data.recovered[index],
              deaths: data.deaths[index],
              // Calculate active cases based on the predicted data
              active: value - data.recovered[index] - data.deaths[index],
            }));
            setChartData(formattedData);
          }
        } catch (error) {
          toast.error(`Failed to load predictions for ${selectedState}.`);
          setChartData([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadStateData();
    }
  }, [selectedState]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>COVID-19 Trend Predictions</CardTitle>
          <CardDescription>
            State-wise ARIMA model predictions for the next 20 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p>Loading predictions...</p>
          ) : chartData.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-4">Confirmed Cases Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="confirmed"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="Confirmed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-4">Recovery & Death Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="recovered"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Recovered"
                    />
                    <Line
                      type="monotone"
                      dataKey="deaths"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      name="Deaths"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-4">Active Cases Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      name="Active"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
             <p>No prediction data available for the selected state.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Predictions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            These predictions are generated using a time-series ARIMA model on the backend, trained on simulated historical data. The model forecasts trends for Confirmed Cases, Recoveries, and Deaths over the next 20 days.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsView;
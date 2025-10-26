import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Syringe, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPatientById, getCaseRecordsByPatient, getVaccinationsByPatient } from "@/lib/apiClient";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [caseRecords, setCaseRecords] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);

  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole");
    const patientId = sessionStorage.getItem("patientId");
    
    if (userRole !== "patient" || !patientId) {
      navigate("/");
      return;
    }

    loadPatientData(patientId);
  }, [navigate]);

  const loadPatientData = async (patientId: string) => {
    try {
      const patient = await getPatientById(patientId);
      setPatientInfo(patient);

      const cases = await getCaseRecordsByPatient(patientId);
      setCaseRecords(cases || []);

      const vax = await getVaccinationsByPatient(patientId);
      setVaccinations(vax || []);
    } catch (error) {
      toast.error("Failed to load patient data");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-warning";
      case "recovered": return "text-secondary";
      case "death": return "text-destructive";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">COVID-19 DBMS</h1>
              <p className="text-sm text-muted-foreground">Patient Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {patientInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-semibold">{patientInfo.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{new Date(patientInfo.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold text-xs">{patientInfo.id.slice(0, 8)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Case Records
            </CardTitle>
            <CardDescription>Your COVID-19 case history</CardDescription>
          </CardHeader>
          <CardContent>
            {caseRecords.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No case records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Diagnosis Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.diag_date).toLocaleDateString()}</TableCell>
                      <TableCell className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </TableCell>
                      <TableCell>{record.locations?.name}</TableCell>
                      <TableCell>{record.locations?.address}, {record.locations?.state}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="w-5 h-5" />
              Vaccination Records
            </CardTitle>
            <CardDescription>Your COVID-19 vaccination history</CardDescription>
          </CardHeader>
          <CardContent>
            {vaccinations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No vaccination records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vaccine Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccinations.map((vax) => (
                    <TableRow key={vax.id}>
                      <TableCell>{new Date(vax.date).toLocaleDateString()}</TableCell>
                      <TableCell>{vax.vaccine_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PatientDashboard;
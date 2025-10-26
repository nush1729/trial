import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { login } from "@/lib/apiClient";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const data = await login({ email, password });
      if (data.role === 'admin') {
        sessionStorage.setItem("userRole", data.role);
        sessionStorage.setItem("userEmail", data.email);
        toast.success("Admin login successful");
        navigate("/admin");
      } else {
        throw new Error("Not an admin user");
      }
    } catch (error) {
      toast.error("Invalid admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const contact = formData.get("contact") as string;
    const password = formData.get("password") as string;

    try {
      const data = await login({ contact, password });
      if (data.role === 'patient') {
        sessionStorage.setItem("userRole", data.role);
        sessionStorage.setItem("patientId", data.id);
        sessionStorage.setItem("patientName", data.name);
        toast.success("Patient login successful");
        navigate("/patient");
      } else {
        throw new Error("Not a patient user");
      }
    } catch (error) {
      toast.error("Patient not found or invalid password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">COVID-19 DBMS</h1>
          <p className="text-muted-foreground mt-2">Database Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your portal to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Admin Portal</TabsTrigger>
                <TabsTrigger value="patient">Patient Portal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" name="email" type="email" defaultValue="admin@covid.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" name="password" type="password" defaultValue="admin123" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="patient">
                <form onSubmit={handlePatientLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-contact">Contact Number</Label>
                    <Input id="patient-contact" name="contact" type="text" placeholder="Enter your contact number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <Input id="patient-password" name="password" type="password" placeholder="Enter your password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In as Patient"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    For demo, your password is your contact number.
                  </p>
                  {/* Add this link to the signup page */}
                  <div className="text-center pt-2">
                    <Link to="/signup" className="text-sm text-blue-500 underline hover:text-blue-700">
                      Don't have an account? Sign Up
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
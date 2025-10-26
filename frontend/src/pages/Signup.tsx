import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { createPatient } from "@/lib/apiClient";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePatientSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const patientData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      contact: formData.get("contact") as string,
      dob: formData.get("dob") as string,
    };

    // Basic validation
    if (!patientData.first_name || !patientData.last_name || !patientData.contact || !patientData.dob) {
        toast.error("Please fill out all fields.");
        setIsLoading(false);
        return;
    }

    try {
      await createPatient(patientData);
      toast.success("Signup successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error("Signup failed. A user with this contact number may already exist.");
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
          <p className="text-muted-foreground mt-2">Patient Registration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Patient Account</CardTitle>
            <CardDescription>Enter your details to register</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePatientSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" placeholder="Aarav" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" placeholder="Sharma" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" name="contact" type="tel" placeholder="9876543210" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" required />
              </div>
              
              <p className="text-xs text-muted-foreground text-center pt-2">
                Your password will be your contact number.
              </p>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-blue-500 underline hover:text-blue-700">
                  Already have an account? Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
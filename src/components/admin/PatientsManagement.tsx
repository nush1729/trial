import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PatientsManagementProps {
  onUpdate: () => void;
}

const PatientsManagement = ({ onUpdate }: PatientsManagementProps) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load patients");
      return;
    }

    setPatients(data || []);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const patientData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      name: `${formData.get("first_name")} ${formData.get("last_name")}`,
      contact: formData.get("contact") as string,
      dob: formData.get("dob") as string,
    };

    if (editingPatient) {
      const { error } = await supabase
        .from("patients")
        .update(patientData)
        .eq("id", editingPatient.id);

      if (error) {
        toast.error("Failed to update patient");
        return;
      }

      toast.success("Patient updated successfully");
    } else {
      const { error } = await supabase.from("patients").insert([patientData]);

      if (error) {
        toast.error("Failed to create patient");
        return;
      }

      toast.success("Patient created successfully");
    }

    setIsOpen(false);
    setEditingPatient(null);
    loadPatients();
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    const { error } = await supabase.from("patients").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete patient");
      return;
    }

    toast.success("Patient deleted successfully");
    loadPatients();
    onUpdate();
  };

  const openDialog = (patient: any = null) => {
    setEditingPatient(patient);
    setIsOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Patients List</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </DialogTitle>
              <DialogDescription>
                {editingPatient
                  ? "Update the patient information"
                  : "Enter the patient details to add to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={editingPatient?.first_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={editingPatient?.last_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  name="contact"
                  defaultValue={editingPatient?.contact}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  defaultValue={editingPatient?.dob}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPatient ? "Update" : "Create"} Patient
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>
                    {new Date(patient.dob).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(patient)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientsManagement;

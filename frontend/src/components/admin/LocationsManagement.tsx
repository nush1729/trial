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
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/lib/apiClient";
import { toast } from "sonner";

const LocationsManagement = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data || []);
    } catch (error) {
      toast.error("Failed to load locations");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const locationData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      street: formData.get("street") as string,
      zip: formData.get("zip") as string,
      state: formData.get("state") as string,
    };

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, locationData);
        toast.success("Location updated successfully");
      } else {
        await createLocation(locationData);
        toast.success("Location created successfully");
      }
    } catch (error) {
        toast.error(editingLocation ? "Failed to update location" : "Failed to create location");
        return;
    }


    setIsOpen(false);
    setEditingLocation(null);
    loadLocations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
        await deleteLocation(id);
        toast.success("Location deleted successfully");
        loadLocations();
    } catch (error) {
        toast.error("Failed to delete location");
    }
  };

  const openDialog = (location: any = null) => {
    setEditingLocation(location);
    setIsOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Locations List</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Location" : "Add New Location"}
              </DialogTitle>
              <DialogDescription>
                Enter the location details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingLocation?.name}
                  placeholder="e.g., City Hospital"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingLocation?.address}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  name="street"
                  defaultValue={editingLocation?.street}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  name="zip"
                  defaultValue={editingLocation?.zip}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={editingLocation?.state}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingLocation ? "Update" : "Create"} Location
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
              <TableHead>Address</TableHead>
              <TableHead>State</TableHead>
              <TableHead>ZIP</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No locations found
                </TableCell>
              </TableRow>
            ) : (
              locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>
                    {location.address}, {location.street}
                  </TableCell>
                  <TableCell>{location.state}</TableCell>
                  <TableCell>{location.zip}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(location)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
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

export default LocationsManagement;
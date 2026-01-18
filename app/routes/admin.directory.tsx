/**
 * Admin Contact Directory Management
 * Task: 1.1.4.3.1
 */

import { useState, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, Form, useNavigation, useActionData, useFetcher } from "react-router";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Switch,
  Textarea,
} from "@heroui/react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Phone,
  Mail,
  AlertTriangle,
  Users,
  Camera,
  X,
  Download,
} from "lucide-react";
import { connectDB } from "~/lib/db/connection.server";
import { requireAuth, getSessionData } from "~/lib/services/session.server";
import { logActivity } from "~/lib/services/activity-log.server";
import {
  getContacts,
  getDepartments,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
  importContactsFromCSV,
  type CSVContactRow,
} from "~/lib/services/contact.server";
import type { IContact, IDepartment } from "~/lib/db/models/contact.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  await connectDB();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const department = url.searchParams.get("department") || "";
  const page = parseInt(url.searchParams.get("page") || "1");

  const [contactsResult, departments, stats] = await Promise.all([
    getContacts({
      search: search || undefined,
      department: department || undefined,
      includeInactive: true,
      page,
      limit: 20,
    }),
    getDepartments({ includeInactive: true }),
    getContactStats(),
  ]);

  return Response.json({
    contacts: JSON.parse(JSON.stringify(contactsResult.contacts)),
    total: contactsResult.total,
    page: contactsResult.page,
    totalPages: contactsResult.totalPages,
    departments: JSON.parse(JSON.stringify(departments)),
    stats,
    filters: { search, department },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  await connectDB();

  const sessionData = await getSessionData(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Create Contact
  if (intent === "create") {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      phoneExtension: formData.get("phoneExtension") as string || undefined,
      email: formData.get("email") as string || undefined,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      photo: formData.get("photo") as string || undefined,
      isEmergencyContact: formData.get("isEmergencyContact") === "true",
      isActive: true,
    };

    if (!data.firstName || !data.lastName || !data.phone || !data.department || !data.position) {
      return Response.json({ error: "All required fields must be filled" });
    }

    const contact = await createContact(data);

    await logActivity({
      userId: sessionData?.userId,
      action: "create",
      resource: "contact",
      resourceId: contact._id.toString(),
      details: { name: `${data.firstName} ${data.lastName}` },
      request,
    });

    return Response.json({ success: true, message: "Contact created successfully" });
  }

  // Update Contact
  if (intent === "update") {
    const id = formData.get("id") as string;
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      phoneExtension: formData.get("phoneExtension") as string || undefined,
      email: formData.get("email") as string || undefined,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      photo: formData.get("photo") as string || undefined,
      isEmergencyContact: formData.get("isEmergencyContact") === "true",
      isActive: formData.get("isActive") === "true",
    };

    await updateContact(id, data);

    await logActivity({
      userId: sessionData?.userId,
      action: "update",
      resource: "contact",
      resourceId: id,
      details: { name: `${data.firstName} ${data.lastName}` },
      request,
    });

    return Response.json({ success: true, message: "Contact updated successfully" });
  }

  // Delete Contact
  if (intent === "delete") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;

    await deleteContact(id);

    await logActivity({
      userId: sessionData?.userId,
      action: "delete",
      resource: "contact",
      resourceId: id,
      details: { name },
      request,
    });

    return Response.json({ success: true, message: "Contact deleted successfully" });
  }

  // Import CSV
  if (intent === "import") {
    const csvData = formData.get("csvData") as string;

    try {
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

      const rows: CSVContactRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        const row: CSVContactRow = {
          firstName: values[headers.indexOf("firstname")] || values[headers.indexOf("first name")] || "",
          lastName: values[headers.indexOf("lastname")] || values[headers.indexOf("last name")] || "",
          phone: values[headers.indexOf("phone")] || "",
          phoneExtension: values[headers.indexOf("extension")] || values[headers.indexOf("ext")] || "",
          email: values[headers.indexOf("email")] || "",
          departmentCode: values[headers.indexOf("department")] || values[headers.indexOf("dept")] || "",
          position: values[headers.indexOf("position")] || values[headers.indexOf("title")] || "",
          isEmergencyContact: values[headers.indexOf("emergency")] || "",
        };
        rows.push(row);
      }

      const result = await importContactsFromCSV(rows);

      await logActivity({
        userId: sessionData?.userId,
        action: "create",
        resource: "contact",
        details: {
          type: "csv_import",
          success: result.success,
          failed: result.failed,
        },
        request,
      });

      return Response.json({
        success: true,
        message: `Imported ${result.success} contacts. ${result.failed} failed.`,
        importResult: result,
      });
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : "Failed to parse CSV",
      });
    }
  }

  return Response.json({ error: "Invalid action" });
}

export default function AdminDirectory() {
  const { contacts, total, page, totalPages, departments, stats, filters } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === "submitting";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<IContact | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<IContact | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [createPhoto, setCreatePhoto] = useState<string>("");
  const [editPhoto, setEditPhoto] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Photo upload handler
  const handlePhotoUpload = async (
    file: File,
    setPhoto: (url: string) => void
  ) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subdir", "photos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.url) {
        setPhoto(result.url);
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (error) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset create photo when modal closes
  const handleCreateClose = () => {
    setIsCreateOpen(false);
    setCreatePhoto("");
  };

  // Set edit photo when modal opens
  const handleEditOpen = (contact: IContact) => {
    setEditContact(contact);
    setEditPhoto(contact.photo || "");
  };

  // Reset edit photo when modal closes
  const handleEditClose = () => {
    setEditContact(null);
    setEditPhoto("");
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleDepartmentChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("department", value);
    } else {
      params.delete("department");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary-100 p-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Contacts</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-warning-100 p-3">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Emergency Contacts</p>
              <p className="text-2xl font-bold">{stats.emergency}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-secondary-100 p-3">
              <Phone className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Search contacts..."
              startContent={<Search size={18} className="text-gray-400" />}
              defaultValue={filters.search}
              onValueChange={handleSearch}
              className="sm:max-w-xs"
              classNames={{ inputWrapper: "bg-gray-50" }}
            />

            <Select
              placeholder="All Departments"
              selectedKeys={filters.department ? [filters.department] : []}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="sm:max-w-xs"
              classNames={{ trigger: "bg-gray-50" }}
            >
              {departments.map((dept: IDepartment) => (
                <SelectItem key={dept._id.toString()} textValue={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<Upload size={18} />}
              onPress={() => setIsImportOpen(true)}
            >
              Import CSV
            </Button>
            <Button
              color="primary"
              startContent={<Plus size={18} />}
              onPress={() => setIsCreateOpen(true)}
            >
              Add Contact
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {actionData.message}
        </div>
      )}
      {actionData?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      {/* Contacts Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Contacts table" removeWrapper>
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>POSITION</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn align="end">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No contacts found">
              {contacts.map((contact: IContact) => (
                <TableRow key={contact._id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={`${contact.firstName} ${contact.lastName}`}
                        src={contact.photo}
                        size="sm"
                        classNames={{
                          base: "bg-primary-100 text-primary-700",
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </span>
                          {contact.isEmergencyContact && (
                            <AlertTriangle
                              size={14}
                              className="text-warning-500"
                            />
                          )}
                        </div>
                        {contact.email && (
                          <span className="text-xs text-gray-500">
                            {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {(contact.department as IDepartment)?.name || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{contact.position}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{contact.phone}</div>
                      {contact.phoneExtension && (
                        <span className="text-xs text-gray-500">
                          ext. {contact.phoneExtension}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={contact.isActive ? "success" : "default"}
                      variant="flat"
                    >
                      {contact.isActive ? "Active" : "Inactive"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditOpen(contact)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => setDeleteConfirm(contact)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>

        {totalPages > 1 && (
          <div className="flex justify-center border-t p-4">
            <Pagination
              total={totalPages}
              page={page}
              onChange={handlePageChange}
              showControls
              color="primary"
            />
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={handleCreateClose} size="2xl">
        <ModalContent>
          <Form method="post" onSubmit={handleCreateClose}>
            <ModalHeader>Add New Contact</ModalHeader>
            <ModalBody>
              <input type="hidden" name="intent" value="create" />
              <input type="hidden" name="photo" value={createPhoto} />
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-2 sm:col-span-2">
                  <div className="relative">
                    <Avatar
                      name="Photo"
                      src={createPhoto}
                      size="lg"
                      className="h-24 w-24"
                      classNames={{
                        base: "bg-gray-100 text-gray-400",
                      }}
                    />
                    {createPhoto && (
                      <button
                        type="button"
                        onClick={() => setCreatePhoto("")}
                        className="absolute -right-1 -top-1 rounded-full bg-danger-500 p-1 text-white hover:bg-danger-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <input
                    ref={createFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, setCreatePhoto);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Camera size={14} />}
                    onPress={() => createFileRef.current?.click()}
                    isLoading={isUploading}
                  >
                    {createPhoto ? "Change Photo" : "Add Photo"}
                  </Button>
                </div>

                <Input
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  isRequired
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  isRequired
                />
                <Input
                  name="phone"
                  label="Phone"
                  placeholder="e.g., 0241234567"
                  isRequired
                />
                <Input
                  name="phoneExtension"
                  label="Extension"
                  placeholder="e.g., 101"
                />
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="email@arl.com"
                />
                <Select
                  name="department"
                  label="Department"
                  placeholder="Select department"
                  isRequired
                >
                  {departments
                    .filter((d: IDepartment) => d.isActive)
                    .map((dept: IDepartment) => (
                      <SelectItem key={dept._id.toString()} textValue={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </Select>
                <Input
                  name="position"
                  label="Position"
                  placeholder="e.g., Senior Engineer"
                  isRequired
                  className="sm:col-span-2"
                />
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Switch name="isEmergencyContact" value="true" />
                  <span className="text-sm">Emergency Contact</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleCreateClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={isSubmitting}>
                Create Contact
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editContact} onClose={handleEditClose} size="2xl">
        <ModalContent>
          {editContact && (
            <Form method="post" onSubmit={handleEditClose}>
              <ModalHeader>Edit Contact</ModalHeader>
              <ModalBody>
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="id" value={editContact._id.toString()} />
                <input type="hidden" name="photo" value={editPhoto} />
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-2 sm:col-span-2">
                    <div className="relative">
                      <Avatar
                        name={`${editContact.firstName} ${editContact.lastName}`}
                        src={editPhoto}
                        size="lg"
                        className="h-24 w-24"
                        classNames={{
                          base: "bg-primary-100 text-primary-700",
                        }}
                      />
                      {editPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditPhoto("")}
                          className="absolute -right-1 -top-1 rounded-full bg-danger-500 p-1 text-white hover:bg-danger-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file, setEditPhoto);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Camera size={14} />}
                      onPress={() => editFileRef.current?.click()}
                      isLoading={isUploading}
                    >
                      {editPhoto ? "Change Photo" : "Add Photo"}
                    </Button>
                  </div>

                  <Input
                    name="firstName"
                    label="First Name"
                    defaultValue={editContact.firstName}
                    isRequired
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    defaultValue={editContact.lastName}
                    isRequired
                  />
                  <Input
                    name="phone"
                    label="Phone"
                    defaultValue={editContact.phone}
                    isRequired
                  />
                  <Input
                    name="phoneExtension"
                    label="Extension"
                    defaultValue={editContact.phoneExtension || ""}
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    defaultValue={editContact.email || ""}
                  />
                  <Select
                    name="department"
                    label="Department"
                    defaultSelectedKeys={[(editContact.department as IDepartment)?._id?.toString() || ""]}
                    isRequired
                  >
                    {departments
                      .filter((d: IDepartment) => d.isActive)
                      .map((dept: IDepartment) => (
                        <SelectItem key={dept._id.toString()} textValue={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </Select>
                  <Input
                    name="position"
                    label="Position"
                    defaultValue={editContact.position}
                    isRequired
                    className="sm:col-span-2"
                  />
                  <div className="flex items-center gap-4 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        name="isEmergencyContact"
                        value="true"
                        defaultSelected={editContact.isEmergencyContact}
                      />
                      <span className="text-sm">Emergency Contact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        name="isActive"
                        value="true"
                        defaultSelected={editContact.isActive}
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleEditClose}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <ModalContent>
          {deleteConfirm && (
            <Form method="post" onSubmit={() => setDeleteConfirm(null)}>
              <ModalHeader>Delete Contact</ModalHeader>
              <ModalBody>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={deleteConfirm._id.toString()} />
                <input
                  type="hidden"
                  name="name"
                  value={`${deleteConfirm.firstName} ${deleteConfirm.lastName}`}
                />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {deleteConfirm.firstName} {deleteConfirm.lastName}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button type="submit" color="danger" isLoading={isSubmitting}>
                  Delete
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      {/* Import CSV Modal */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} size="2xl">
        <ModalContent>
          <Form method="post" onSubmit={() => setIsImportOpen(false)}>
            <ModalHeader>Import Contacts from CSV</ModalHeader>
            <ModalBody>
              <input type="hidden" name="intent" value="import" />
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">CSV Format:</p>
                      <code className="mt-2 block text-xs">
                        FirstName,LastName,Phone,Extension,Email,Department,Position,Emergency
                      </code>
                      <p className="mt-2 text-gray-600">
                        Department should be the department code (e.g., MINING, HR, IT).
                        Emergency should be &quot;yes&quot; or &quot;no&quot;.
                      </p>
                    </div>
                    <Button
                      as="a"
                      href="/api/csv-template"
                      download
                      size="sm"
                      variant="bordered"
                      startContent={<Download size={14} />}
                    >
                      Template
                    </Button>
                  </div>
                </div>
                <Textarea
                  name="csvData"
                  label="CSV Data"
                  placeholder="Paste your CSV data here..."
                  value={csvData}
                  onValueChange={setCsvData}
                  minRows={10}
                  isRequired
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setIsImportOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isSubmitting}
                isDisabled={!csvData.trim()}
              >
                Import
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
}

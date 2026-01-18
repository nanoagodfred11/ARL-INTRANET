/**
 * Company Directory Listing
 * Task: 1.1.4.2.1
 */

import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, Form } from "react-router";
import {
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Avatar,
  Chip,
  Button,
  Pagination,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  Search,
  Phone,
  Mail,
  Building2,
  AlertTriangle,
  User,
  X,
} from "lucide-react";
import { MainLayout } from "~/components/layout";
import { connectDB } from "~/lib/db/connection.server";
import { getContacts, getDepartments, getContactLetters, type PaginatedContacts } from "~/lib/services/contact.server";
import type { IContact, IDepartment } from "~/lib/db/models/contact.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const department = url.searchParams.get("department") || "";
  const letter = url.searchParams.get("letter") || "";
  const emergency = url.searchParams.get("emergency") === "true";
  const page = parseInt(url.searchParams.get("page") || "1");

  const [contactsResult, departments, availableLetters] = await Promise.all([
    getContacts({
      search: search || undefined,
      department: department || undefined,
      letter: letter || undefined,
      isEmergencyContact: emergency || undefined,
      page,
      limit: 24,
    }),
    getDepartments(),
    getContactLetters(),
  ]);

  return Response.json({
    contacts: JSON.parse(JSON.stringify(contactsResult.contacts)),
    total: contactsResult.total,
    page: contactsResult.page,
    totalPages: contactsResult.totalPages,
    departments: JSON.parse(JSON.stringify(departments)),
    availableLetters,
    filters: { search, department, letter, emergency },
  });
}

// All letters A-Z for the navigation
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function DirectoryPage() {
  const { contacts, total, page, totalPages, departments, availableLetters, filters } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);

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

  const handleEmergencyToggle = () => {
    const params = new URLSearchParams(searchParams);
    if (filters.emergency) {
      params.delete("emergency");
    } else {
      params.set("emergency", "true");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleLetterClick = (letter: string) => {
    const params = new URLSearchParams(searchParams);
    if (filters.letter === letter) {
      params.delete("letter");
    } else {
      params.set("letter", letter);
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = filters.search || filters.department || filters.letter || filters.emergency;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Directory</h1>
          <p className="mt-2 text-gray-600">
            Find contact information for ARL employees and departments
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody className="gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                placeholder="Search by name, position, or phone..."
                startContent={<Search size={18} className="text-gray-400" />}
                defaultValue={filters.search}
                onValueChange={handleSearch}
                className="flex-1"
                classNames={{ inputWrapper: "bg-gray-50" }}
              />

              <Select
                placeholder="All Departments"
                selectedKeys={filters.department ? [filters.department] : []}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full sm:w-64"
                classNames={{ trigger: "bg-gray-50" }}
              >
                {departments.map((dept: IDepartment) => (
                  <SelectItem key={dept._id.toString()} textValue={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </Select>

              <Button
                variant={filters.emergency ? "solid" : "bordered"}
                color={filters.emergency ? "warning" : "default"}
                startContent={<AlertTriangle size={18} />}
                onPress={handleEmergencyToggle}
                className="shrink-0"
              >
                Emergency Contacts
              </Button>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.search && (
                  <Chip size="sm" onClose={() => handleSearch("")}>
                    Search: {filters.search}
                  </Chip>
                )}
                {filters.department && (
                  <Chip size="sm" onClose={() => handleDepartmentChange("")}>
                    {departments.find((d: IDepartment) => d._id.toString() === filters.department)?.name}
                  </Chip>
                )}
                {filters.letter && (
                  <Chip size="sm" color="primary" onClose={() => handleLetterClick(filters.letter)}>
                    Letter: {filters.letter}
                  </Chip>
                )}
                {filters.emergency && (
                  <Chip size="sm" color="warning" onClose={handleEmergencyToggle}>
                    Emergency Only
                  </Chip>
                )}
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={clearFilters}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Alphabetical Navigation */}
        <Card className="mb-6">
          <CardBody className="py-3">
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span className="mr-2 text-sm font-medium text-gray-600">Jump to:</span>
              {ALPHABET.map((letter) => {
                const hasContacts = availableLetters.includes(letter);
                const isActive = filters.letter === letter;
                return (
                  <Button
                    key={letter}
                    size="sm"
                    variant={isActive ? "solid" : "light"}
                    color={isActive ? "primary" : "default"}
                    isDisabled={!hasContacts}
                    onPress={() => handleLetterClick(letter)}
                    className={`min-w-8 h-8 px-0 font-semibold ${
                      !hasContacts ? "opacity-30" : ""
                    }`}
                  >
                    {letter}
                  </Button>
                );
              })}
              {filters.letter && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={() => handleLetterClick(filters.letter)}
                  className="ml-2"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {contacts.length} of {total} contacts
            {filters.letter && ` starting with "${filters.letter}"`}
          </p>
        </div>

        {/* Contact Grid */}
        {contacts.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {contacts.map((contact: IContact) => (
                <Card
                  key={contact._id.toString()}
                  isPressable
                  onPress={() => setSelectedContact(contact)}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardBody className="gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={`${contact.firstName} ${contact.lastName}`}
                        src={contact.photo}
                        size="lg"
                        classNames={{
                          base: "bg-primary-100 text-primary-700 font-semibold",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          {contact.isEmergencyContact && (
                            <AlertTriangle
                              size={14}
                              className="shrink-0 text-warning-500"
                            />
                          )}
                        </div>
                        <p className="truncate text-sm text-gray-600">
                          {contact.position}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {(contact.department as IDepartment)?.name}
                        </p>
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="shrink-0 text-gray-400" />
                        <span className="text-gray-700">{contact.phone}</span>
                        {contact.phoneExtension && (
                          <span className="text-gray-500">
                            ext. {contact.phoneExtension}
                          </span>
                        )}
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="shrink-0 text-gray-400" />
                          <span className="truncate text-gray-700">
                            {contact.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  showControls
                  color="primary"
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardBody className="py-12 text-center">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">
                No contacts found
              </h3>
              <p className="mt-1 text-gray-500">
                {hasFilters
                  ? "Try adjusting your filters"
                  : "The directory is empty"}
              </p>
              {hasFilters && (
                <Button
                  variant="light"
                  color="primary"
                  className="mt-4"
                  onPress={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        {/* Contact Detail Modal */}
        <Modal
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          size="lg"
        >
          <ModalContent>
            {selectedContact && (
              <>
                <ModalHeader className="flex items-center gap-4">
                  <Avatar
                    name={`${selectedContact.firstName} ${selectedContact.lastName}`}
                    src={selectedContact.photo}
                    size="lg"
                    classNames={{
                      base: "bg-primary-100 text-primary-700 font-semibold",
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </h2>
                      {selectedContact.isEmergencyContact && (
                        <Chip size="sm" color="warning" variant="flat">
                          Emergency Contact
                        </Chip>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedContact.position}
                    </p>
                  </div>
                </ModalHeader>

                <ModalBody>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Building2 size={20} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium">
                          {(selectedContact.department as IDepartment)?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Phone size={20} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a
                          href={`tel:${selectedContact.phone}`}
                          className="font-medium text-primary-600 hover:underline"
                        >
                          {selectedContact.phone}
                          {selectedContact.phoneExtension && (
                            <span className="text-gray-500">
                              {" "}ext. {selectedContact.phoneExtension}
                            </span>
                          )}
                        </a>
                      </div>
                    </div>

                    {selectedContact.email && (
                      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <Mail size={20} className="text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <a
                            href={`mailto:${selectedContact.email}`}
                            className="font-medium text-primary-600 hover:underline"
                          >
                            {selectedContact.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={() => setSelectedContact(null)}
                  >
                    Close
                  </Button>
                  <Button
                    color="primary"
                    as="a"
                    href={`tel:${selectedContact.phone}`}
                    startContent={<Phone size={16} />}
                  >
                    Call
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </MainLayout>
  );
}

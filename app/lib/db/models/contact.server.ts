import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  category: "operations" | "support" | "dfsl" | "contractors";
  description?: string;
  headOfDepartment?: Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  phoneExtension?: string;
  email?: string;
  department: Types.ObjectId;
  position: string;
  photo?: string;
  isEmergencyContact: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["operations", "support", "dfsl", "contractors"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headOfDepartment: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ContactSchema = new Schema<IContact>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneExtension: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
    },
    isEmergencyContact: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate fullName
ContactSchema.pre("save", function () {
  this.fullName = `${this.firstName} ${this.lastName}`;
});

// Indexes for common queries
DepartmentSchema.index({ category: 1, isActive: 1 });
DepartmentSchema.index({ name: "text" });

ContactSchema.index({ department: 1, isActive: 1 });
ContactSchema.index({ lastName: 1, firstName: 1 });
ContactSchema.index({ fullName: "text", position: "text" });

export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

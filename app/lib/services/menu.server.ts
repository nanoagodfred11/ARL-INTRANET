/**
 * Menu Service
 * Task: 1.2.4.1.3 - Create GET /api/menu/today endpoint
 * Task: 1.2.4.1.4 - Create GET /api/menu/week endpoint
 * Task: 1.2.4.1.5 - Create CRUD endpoints for admin
 * Task: 1.2.4.1.6 - Implement menu templates for quick creation
 */

import {
  Menu,
  MenuTemplate,
  type IMenu,
  type IMenuTemplate,
  type IMeal,
  type IMenuItem,
} from "~/lib/db/models/menu.server";

import {
  dietaryInfo,
  mealTimeInfo,
  type SerializedMenu,
  type SerializedMeal,
  type SerializedMenuItem,
  type SerializedMenuTemplate,
  type MealType,
  type DietaryType,
} from "~/lib/utils/menu-constants";

// Re-export shared constants and types from client-safe file
export {
  dietaryInfo,
  mealTimeInfo,
  type SerializedMenu,
  type SerializedMeal,
  type SerializedMenuItem,
  type SerializedMenuTemplate,
  type MealType,
  type DietaryType,
};

// Serialization helpers
export function serializeMenu(menu: IMenu): SerializedMenu {
  return {
    id: menu._id.toString(),
    date: menu.date.toISOString(),
    meals: menu.meals.map(serializeMeal),
    isActive: menu.isActive,
    notes: menu.notes,
    createdBy: menu.createdBy && typeof menu.createdBy === "object" && "name" in menu.createdBy
      ? {
          id: (menu.createdBy as any)._id.toString(),
          name: (menu.createdBy as any).name,
        }
      : undefined,
    createdAt: menu.createdAt.toISOString(),
    updatedAt: menu.updatedAt.toISOString(),
  };
}

export function serializeMeal(meal: IMeal): SerializedMeal {
  return {
    type: meal.type,
    items: meal.items.map(serializeMenuItem),
    startTime: meal.startTime,
    endTime: meal.endTime,
  };
}

export function serializeMenuItem(item: IMenuItem): SerializedMenuItem {
  return {
    name: item.name,
    description: item.description,
    dietary: item.dietary,
    isAvailable: item.isAvailable,
  };
}

export function serializeMenuTemplate(template: IMenuTemplate): SerializedMenuTemplate {
  return {
    id: template._id.toString(),
    name: template.name,
    description: template.description,
    meals: template.meals.map(serializeMeal),
    isDefault: template.isDefault,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

// Get today's menu
export async function getTodayMenu(): Promise<IMenu | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Menu.findOne({
    date: { $gte: today, $lt: tomorrow },
    isActive: true,
  }).populate("createdBy", "name");
}

// Get menu by date
export async function getMenuByDate(date: Date): Promise<IMenu | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return Menu.findOne({
    date: { $gte: startOfDay, $lt: endOfDay },
  }).populate("createdBy", "name");
}

// Get week's menus
export async function getWeekMenus(startDate?: Date): Promise<IMenu[]> {
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  // Get to start of week (Monday)
  const dayOfWeek = start.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - daysToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return Menu.find({
    date: { $gte: start, $lt: end },
  })
    .sort({ date: 1 })
    .populate("createdBy", "name");
}

// Get menus with pagination
export async function getMenus(options: {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ menus: IMenu[]; total: number; page: number; totalPages: number }> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (options.startDate || options.endDate) {
    query.date = {};
    if (options.startDate) {
      query.date.$gte = options.startDate;
    }
    if (options.endDate) {
      query.date.$lte = options.endDate;
    }
  }

  const [menus, total] = await Promise.all([
    Menu.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name"),
    Menu.countDocuments(query),
  ]);

  return {
    menus,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Create menu
export async function createMenu(data: {
  date: Date;
  meals: IMeal[];
  notes?: string;
  isActive?: boolean;
  createdBy: string;
}): Promise<IMenu> {
  // Normalize date to start of day
  const menuDate = new Date(data.date);
  menuDate.setHours(0, 0, 0, 0);

  // Check if menu already exists for this date
  const existing = await getMenuByDate(menuDate);
  if (existing) {
    throw new Error("A menu already exists for this date");
  }

  const menu = new Menu({
    date: menuDate,
    meals: data.meals,
    notes: data.notes,
    isActive: data.isActive ?? true,
    createdBy: data.createdBy,
  });

  await menu.save();
  return menu.populate("createdBy", "name");
}

// Update menu
export async function updateMenu(
  id: string,
  data: {
    meals?: IMeal[];
    notes?: string;
    isActive?: boolean;
  }
): Promise<IMenu | null> {
  const menu = await Menu.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  ).populate("createdBy", "name");

  return menu;
}

// Delete menu
export async function deleteMenu(id: string): Promise<boolean> {
  const result = await Menu.findByIdAndDelete(id);
  return !!result;
}

// Copy menu to another date
export async function copyMenu(sourceId: string, targetDate: Date, userId: string): Promise<IMenu> {
  const sourceMenu = await Menu.findById(sourceId);
  if (!sourceMenu) {
    throw new Error("Source menu not found");
  }

  return createMenu({
    date: targetDate,
    meals: sourceMenu.meals,
    notes: sourceMenu.notes,
    createdBy: userId,
  });
}

// Bulk create menus for a week
export async function createWeekMenus(
  startDate: Date,
  templates: { [day: number]: IMeal[] },
  userId: string
): Promise<IMenu[]> {
  const menus: IMenu[] = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const menuDate = new Date(start);
    menuDate.setDate(menuDate.getDate() + i);
    const dayOfWeek = menuDate.getDay();

    if (templates[dayOfWeek]) {
      try {
        const menu = await createMenu({
          date: menuDate,
          meals: templates[dayOfWeek],
          createdBy: userId,
        });
        menus.push(menu);
      } catch (error) {
        // Skip if menu already exists
        console.error(`Menu already exists for ${menuDate.toDateString()}`);
      }
    }
  }

  return menus;
}

// Menu Template functions

// Get all templates
export async function getMenuTemplates(): Promise<IMenuTemplate[]> {
  return MenuTemplate.find().sort({ isDefault: -1, name: 1 });
}

// Get template by ID
export async function getMenuTemplateById(id: string): Promise<IMenuTemplate | null> {
  return MenuTemplate.findById(id);
}

// Create template
export async function createMenuTemplate(data: {
  name: string;
  description?: string;
  meals: IMeal[];
  isDefault?: boolean;
  createdBy: string;
}): Promise<IMenuTemplate> {
  // If setting as default, unset any existing default
  if (data.isDefault) {
    await MenuTemplate.updateMany({}, { isDefault: false });
  }

  const template = new MenuTemplate(data);
  await template.save();
  return template;
}

// Update template
export async function updateMenuTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    meals?: IMeal[];
    isDefault?: boolean;
  }
): Promise<IMenuTemplate | null> {
  // If setting as default, unset any existing default
  if (data.isDefault) {
    await MenuTemplate.updateMany({ _id: { $ne: id } }, { isDefault: false });
  }

  return MenuTemplate.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );
}

// Delete template
export async function deleteMenuTemplate(id: string): Promise<boolean> {
  const result = await MenuTemplate.findByIdAndDelete(id);
  return !!result;
}

// Apply template to create menu
export async function applyTemplate(templateId: string, date: Date, userId: string): Promise<IMenu> {
  const template = await getMenuTemplateById(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  return createMenu({
    date,
    meals: template.meals,
    createdBy: userId,
  });
}

// Get menu stats
export async function getMenuStats(): Promise<{
  totalMenus: number;
  thisWeek: number;
  nextWeek: number;
  templates: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const startOfNextWeek = new Date(endOfWeek);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  const [totalMenus, thisWeek, nextWeek, templates] = await Promise.all([
    Menu.countDocuments(),
    Menu.countDocuments({ date: { $gte: startOfWeek, $lt: endOfWeek } }),
    Menu.countDocuments({ date: { $gte: startOfNextWeek, $lt: endOfNextWeek } }),
    MenuTemplate.countDocuments(),
  ]);

  return {
    totalMenus,
    thisWeek,
    nextWeek,
    templates,
  };
}

export type { IMenu, IMenuTemplate, IMeal, IMenuItem };

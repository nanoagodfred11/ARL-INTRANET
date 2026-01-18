import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),

  // Public news routes
  route("news", "routes/news._index.tsx"),
  route("news/:slug", "routes/news.$slug.tsx"),

  // Public directory routes
  route("directory", "routes/directory._index.tsx"),

  // Public apps routes
  route("apps", "routes/apps._index.tsx"),

  // Public toolbox talk routes (Phase 2)
  route("toolbox-talk", "routes/toolbox-talk._index.tsx"),
  route("toolbox-talk/:slug", "routes/toolbox-talk.$slug.tsx"),

  // API routes
  route("api/quick-links", "routes/api.quick-links.tsx"),
  route("api/upload", "routes/api.upload.tsx"),
  route("api/csv-template", "routes/api.csv-template.tsx"),

  // Admin routes
  layout("routes/admin.tsx", [
    route("admin", "routes/admin._index.tsx"),
    route("admin/login", "routes/admin.login.tsx"),
    route("admin/logout", "routes/admin.logout.tsx"),
    route("admin/users", "routes/admin.users.tsx"),
    route("admin/activity", "routes/admin.activity.tsx"),

    // Admin news routes
    route("admin/news", "routes/admin.news._index.tsx"),
    route("admin/news/new", "routes/admin.news.new.tsx"),
    route("admin/news/categories", "routes/admin.news.categories.tsx"),
    route("admin/news/:id/edit", "routes/admin.news.$id.edit.tsx"),

    // Admin directory routes
    route("admin/directory", "routes/admin.directory.tsx"),
    route("admin/departments", "routes/admin.departments.tsx"),

    // Admin apps routes
    route("admin/apps", "routes/admin.apps.tsx"),
    route("admin/apps/categories", "routes/admin.apps.categories.tsx"),

    // Admin toolbox talk routes (Phase 2)
    route("admin/toolbox-talks", "routes/admin.toolbox-talks._index.tsx"),
    route("admin/toolbox-talks/new", "routes/admin.toolbox-talks.new.tsx"),
    route("admin/toolbox-talks/:id/edit", "routes/admin.toolbox-talks.$id.edit.tsx"),
  ]),
] satisfies RouteConfig;

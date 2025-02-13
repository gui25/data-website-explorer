export const placeholderSchema = [
  {
    name: "plan",
    fields: [
      {
        name: "id",
        type: "number",
        primaryKey: true,
      },
      {
        name: "name",
        type: "text",
      },
      {
        name: "created",
        type: "autodate",
      },
      {
        name: "your_id",
        type: "relation",
        relatedCollection: "your",
      },
    ],
  },
  {
    name: "your",
    fields: [
      {
        name: "id",
        type: "number",
        primaryKey: true,
      },
      {
        name: "description",
        type: "text",
      },
      {
        name: "pocketbase_id",
        type: "relation",
        relatedCollection: "pocketbase",
      },
    ],
  },
  {
    name: "pocketbase",
    fields: [
      {
        name: "id",
        type: "number",
        primaryKey: true,
      },
      {
        name: "version",
        type: "text",
      },
      {
        name: "last_updated",
        type: "autodate",
      },
    ],
  },
]


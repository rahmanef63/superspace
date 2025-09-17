import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Plus,
  Settings,
  Filter,
  SortAsc,
  Eye,
  MoreHorizontal,
} from "lucide-react";

type DbTable = NonNullable<typeof api.menu.page.db.tables.get._returnType>;
type DbFieldList = typeof api.menu.page.db.fields.list._returnType;
type DbField = DbFieldList extends Array<infer Item> ? Item : never;
type DbRowList = typeof api.menu.page.db.rows.list._returnType;
type DbRow = DbRowList extends Array<infer Item> ? Item : never;

interface DatabaseViewProps {
  tableId: Id<"dbTables">;
}

export function DatabaseView({ tableId }: DatabaseViewProps) {
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: Id<"dbRows">; fieldId: Id<"dbFields"> } | null>(null);

  const table = useQuery(api.menu.page.db.tables.get, { id: tableId });
  const fieldsData = useQuery(api.menu.page.db.fields.list, { tableId });
  const rowsData = useQuery(api.menu.page.db.rows.list, { tableId });

  const createRow = useMutation(api.menu.page.db.rows.create);
  const updateRow = useMutation(api.menu.page.db.rows.update);
  const createField = useMutation(api.menu.page.db.fields.create);

  if (table === undefined || fieldsData === undefined || rowsData === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading database...</div>
      </div>
    );
  }

  if (table === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">You do not have access to this table.</div>
      </div>
    );
  }

  const tableRecord: DbTable = table;
  const fields = fieldsData ?? [];
  const rows = rowsData ?? [];

  const handleAddRow = async () => {
    if (fields.length === 0) return;

    const defaultData: Record<string, unknown> = {};
    fields.forEach((field: DbField) => {
      if (field.name === "Name") {
        defaultData[field._id] = "Untitled";
      }
    });

    try {
      await createRow({
        tableId,
        data: defaultData,
      });
      setIsAddingRow(false);
    } catch (error) {
      console.error("Failed to create row:", error);
    }
  };

  const handleAddField = async () => {
    try {
      await createField({
        name: "New Property",
        type: "text",
        tableId,
      });
    } catch (error) {
      console.error("Failed to create field:", error);
    }
  };

  const handleCellEdit = async (rowId: Id<"dbRows">, fieldId: Id<"dbFields">, value: unknown) => {
    try {
      await updateRow({
        id: rowId,
        data: { [fieldId]: value },
      });
      setEditingCell(null);
    } catch (error) {
      console.error("Failed to update cell:", error);
    }
  };

  const handleCellClick = (rowId: Id<"dbRows">, fieldId: Id<"dbFields">) => {
    setEditingCell({ rowId, fieldId });
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{tableRecord.icon ?? "🗂️"}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tableRecord.name}</h1>
              {tableRecord.description && <p className="text-gray-600 mt-1">{tableRecord.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <SortAsc className="w-4 h-4" />
              Sort
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Eye className="w-4 h-4" />
              View
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {fields.map((field: DbField) => (
                <th
                  key={field._id}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200 min-w-[150px]"
                >
                  <div className="flex items-center gap-2">
                    <span>{field.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{field.type}</span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 w-12">
                <button
                  onClick={handleAddField}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Add property"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: DbRow) => (
              <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50">
                {fields.map((field: DbField) => (
                  <td
                    key={field._id}
                    className="px-4 py-3 border-r border-gray-100 cursor-pointer"
                    onClick={() => handleCellClick(row._id, field._id)}
                  >
                    {editingCell?.rowId === row._id && editingCell?.fieldId === field._id ? (
                      <input
                        type="text"
                        defaultValue={(row.data?.[field._id] as string | undefined) ?? ""}
                        onBlur={(event) => handleCellEdit(row._id, field._id, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleCellEdit(row._id, field._id, event.currentTarget.value);
                          }
                          if (event.key === "Escape") {
                            setEditingCell(null);
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="min-h-[20px]">
                        {(row.data?.[field._id] as string | undefined) ?? (
                          <span className="text-gray-400">Empty</span>
                        )}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}

            <tr className="border-b border-gray-100">
              <td colSpan={fields.length + 1} className="px-4 py-3">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded w-full"
                  disabled={isAddingRow}
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

export default function DeleteForm({ action, idField, id, name, label = "Delete" }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Remove ${name}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name={idField} value={id} />
      <button className="admin-delete" type="submit">
        {label}
      </button>
    </form>
  );
}

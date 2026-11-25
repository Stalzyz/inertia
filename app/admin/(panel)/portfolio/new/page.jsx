import ProjectForm from "@/components/admin/ProjectForm";
import { saveProject } from "../../actions";

export const metadata = { title: "Add project — Studio admin" };

export default function NewProjectPage() {
  return (
    <>
      <div className="admin-heading">
        <p className="label">Portfolio / New</p>
        <h1 className="admin-title">Add a project.</h1>
        <p className="admin-lede">
          Document the live site as published. Avoid performance claims or
          testimonials that have not been verified.
        </p>
      </div>
      <div className="admin-panel">
        <ProjectForm action={saveProject} />
      </div>
    </>
  );
}

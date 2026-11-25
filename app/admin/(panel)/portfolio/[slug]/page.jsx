import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProject } from "@/lib/portfolio";
import { saveProject } from "../../actions";

export default async function EditProjectPage({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <div className="admin-heading">
        <p className="label">Portfolio / Edit</p>
        <h1 className="admin-title">{project.name}</h1>
        <p className="admin-lede">
          Changes publish to the portfolio and case study as soon as you save.
        </p>
      </div>
      <div className="admin-panel">
        <ProjectForm action={saveProject} project={project} />
      </div>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookmarkCheck, Briefcase, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PORTAL_STORAGE_KEYS, readPortalState, seedJobs, writePortalState, type PortalJob } from "@/lib/jobs/portal-data";

export const Route = createFileRoute("/jobs/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved Jobs — SchemeSync Jobs" }] }),
  component: SavedJobsPage,
});

function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<PortalJob[]>([]);

  useEffect(() => {
    const ids = readPortalState<string[]>(PORTAL_STORAGE_KEYS.savedJobs, []);
    const jobs = seedJobs.filter((job) => ids.includes(job.id));
    setSavedJobs(jobs);
  }, []);

  const removeJob = (jobId: string) => {
    const ids = readPortalState<string[]>(PORTAL_STORAGE_KEYS.savedJobs, []);
    const next = ids.filter((id) => id !== jobId);
    writePortalState(PORTAL_STORAGE_KEYS.savedJobs, next);
    setSavedJobs(seedJobs.filter((job) => next.includes(job.id)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="mt-2 text-muted-foreground">
          Jobs you've saved for later
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
        >
          <BookmarkCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No saved jobs yet.</p>
          <Button asChild size="sm" variant="outline" className="mt-4">
            <Link to="/jobs/search">Browse jobs</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">{job.job_title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{job.company_name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Saved {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="shrink-0 flex gap-2">
                  <Button size="sm" className="bg-gradient-primary">
                    View Job
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeJob(job.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

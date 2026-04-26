'use client';

interface TimelineActivity {
  time: string;
  title: string;
  location: string;
  description: string;
  duration?: string;
  cost?: string;
  type: 'attraction' | 'meal' | 'transport' | 'accommodation';
  rating?: number;
}

interface TimelineDay {
  day: number;
  date: string;
  activities: TimelineActivity[];
}

interface ItineraryTimelineProps {
  destination: string;
  days: TimelineDay[];
}

const activityStyles: Record<TimelineActivity['type'], { badge: string; dot: string }> = {
  attraction: { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-600' },
  meal: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-600' },
  accommodation: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' },
  transport: { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-600' }
};

export default function ItineraryTimeline({ destination, days }: ItineraryTimelineProps) {
  if (days.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Trip timeline</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Your {destination} plan, day by day</h2>
        </div>
        <p className="text-sm text-slate-500">{days.length} days of places, meals, and movement, organized into one readable flow.</p>
      </div>

      <div className="space-y-8">
        {days.map((day) => (
          <article key={`${day.day}-${day.date}`} className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Day {day.day}</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{day.date}</h3>
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {day.activities.length} activities
              </span>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-[15px] top-1 h-full w-px bg-slate-200" />

              <div className="space-y-4">
                {day.activities.map((activity, index) => {
                  const style = activityStyles[activity.type];

                  return (
                    <div key={`${day.day}-${index}-${activity.title}`} className="relative">
                      <div className={`absolute -left-8 top-2 h-3 w-3 rounded-full ring-4 ring-slate-50 ${style.dot}`} />

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{activity.time}</span>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style.badge}`}>
                                {activity.type}
                              </span>
                              {typeof activity.rating === 'number' && (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  {activity.rating.toFixed(1)} rating
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-lg font-semibold text-slate-900">{activity.title}</h4>
                              <p className="mt-1 text-sm text-slate-500">{activity.location}</p>
                            </div>
                          </div>

                          <div className="text-sm text-slate-500 md:text-right">
                            {activity.duration && <p>{activity.duration}</p>}
                            {activity.cost && <p className="mt-1 font-medium text-slate-700">{activity.cost}</p>}
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-600">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
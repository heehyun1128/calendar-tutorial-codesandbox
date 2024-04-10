import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";

import './WithoutGroups.css';

import { PHASES_COLORS } from './utils';

const getResources = (campaigns) => campaigns
  .map(({ id, name, members, type, from, to }) => ({
    id,
    members,
    type,
    from,
    to,
    title: name,
  }));

const getEvents = (campaigns) => campaigns.map(
  ({ id, steps }) => steps.map(({ name, from, to, phase }) => ({
    title: name,
    resourceId: id,
    start: new Date(from),
    end: new Date(to),
    allDay: true,
    phase: phase,
    color: PHASES_COLORS[phase],
  }))
).flat();

const Step = ({ event }) => {
  const { extendedProps } = event;
  return (
    <div
      className="fc-event-title fc-sticky eventDiv"
      title={`${event.title} (${extendedProps.phase})`}
    >
      <div className="eventPhase">{ extendedProps.phase }</div>
      <div className="eventTitle">{ event.title }</div>
    </div>
  )
};

const Campaign = ({ resource }) => {
  const { extendedProps } = resource;
  return (
    <div className="campaign">
      <span className="campaignTitle">
        { resource.title }
      </span>
      <div className="campaignType">
        { extendedProps.type }
      </div>
    </div>
  );
};

const WithoutGroups = ({ campaigns }) => {
  return (
    <div>
      <FullCalendar
        plugins={[resourceTimelinePlugin]}
        initialView="resourceTimelineYear"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimelineMonth,resourceTimelineWeek,resourceTimelineYear'
        }}
        resourceAreaHeaderContent="Campaigns"
        resources={getResources(campaigns)}
        events={getEvents(campaigns)}
        eventContent={Step}
        resourceLabelContent={Campaign}
        slotDuration={{ day: 1 }}
        slotLabelFormat={[
          { month: 'long' },
          { weekday: 'short', day: '2-digit' },
        ]}
        resourceOrder="from"
      />
    </div>
  );
};

export default WithoutGroups;
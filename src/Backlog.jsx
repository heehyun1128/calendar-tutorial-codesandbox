import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import './Backlog.css';

import { PHASES_COLORS } from './utils';

const getEvents = (campaigns) => campaigns.map(
  ({ id, steps, name: campaignName, from: campaignFrom, to: campaignTo, members }) => steps.map(({ id: evtId, name, from, to, phase }) => ({
    title: name,
    start: new Date(from),
    end: new Date(to),
    allDay: true,
    phase: phase,
    color: PHASES_COLORS[phase],
    type: 'step',
    campaign: {
      id,
      from: campaignFrom,
      to: campaignTo,
      name: campaignName,
    },
    id: evtId,
  }))
).flat();


const Event = ({ event }) => {
  const { extendedProps } = event;
  return (
    <div>
      { event.title }
      &nbsp;
      <small>({ extendedProps.campaign.name })</small>
    </div>
  );
};

const Backlog = ({ campaigns }) => {

  return (
    <FullCalendar
      plugins={[interactionPlugin, listPlugin]}
      initialView="listWeek"
      editable
      events={getEvents(campaigns)}
      eventContent={Event}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'listWeek,listMonth'
      }}
    />
  );
};

export default Backlog;
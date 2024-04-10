import { useState } from 'react';

import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from '@fullcalendar/interaction';

import './GroupByCampaigns.css';

import { PHASES_COLORS } from './utils';

const getResources = 
  (campaigns) => campaigns
    .map(
      ({ id, name, from, to }) => ({
        id,
        from,
        to,
        title: name,
        children: [{
          id: `${id}-sub`,
          title: 'Steps',
        }]
      })
    );

const getEvents = (campaigns) => campaigns.map(
  ({ id, steps, name: campaignName, from: campaignFrom, to: campaignTo, members }) => steps.map(({ id: evtId, name, from, to, phase }) => ({
    title: name,
    resourceId: `${id}-sub`,
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
    },
    id: evtId,
  })).concat([{
    members,
    title: campaignName,
    resourceId: id,
    start: new Date(campaignFrom),
    end: new Date(campaignTo),
    color: '#053B61',
    allDay: true,
    type: 'campaign',
  }])
).flat();

const StepEvent = ({ event }) => {
  const { extendedProps } = event; 
  return (
    <div
      className="fc-event-title fc-sticky eventStepDiv"
      title={`${event.title} (${extendedProps.phase})`}
    >
      <div className="eventTitle">{ event.title }</div>
    </div>
  )
};

const CampaignEvent = ({ event }) => {
  const { extendedProps } = event;
  return (
    <div className="fc-event-title fc-sticky eventCampaignDiv">
    </div>
  )
};

const Event = ({ event }) => {
  return (
    <>
      { event.extendedProps.type === 'campaign' && (
        <CampaignEvent event={event} />
      )}
      { event.extendedProps.type === 'step' && (
        <StepEvent event={event} />
      )}
    </>
  );
};

const Campaign = ({ groupValue }) => {
  return (
    <span>
      <small>
        { groupValue }
      </small>
    </span>
  );
};

const GroupByCampaigns = ({ campaigns }) => {
  const [mode, setMode] = useState('month');
  const [events, setEvents] = useState(getEvents(campaigns));

  let duration = null;
  let slotDuration = null;
  let slotLabelFormat = null;

  switch(mode) {
    case 'month':
      duration = { months: 1 };
      slotDuration= { days: 1 };
      slotLabelFormat = [
        { month: 'long' },
        { day: '2-digit' },
      ];
      break;
    case 'week':
      duration = { weeks: 1 };
      slotDuration= { days: 1 };
      slotLabelFormat = [
        { month: 'long' },
        { day: '2-digit' },
      ];
      break;
    case '2weeks':
      duration = { weeks: 2 };
      slotDuration= { days: 1 };
      slotLabelFormat = [
        { month: 'long' },
        { day: '2-digit' },
      ];
      break;
    case '6months':
      duration = { months: 6 };
      slotDuration= { months: 1 };
      slotLabelFormat = [
        { month: 'long' }
      ];
      break;
    case 'year':
      duration = { years: 1 };
      slotDuration= { months: 1 };
      slotLabelFormat = [
        { month: 'long' }
      ];
      break;
    default:
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        <div className="fc fc-media-screen fc-direction-ltr fc-theme-standard" style={{
          width: 500,
        }}>
          <div className="fc-button-group">
            <button
              className={`fc-resourceTimelineMonth-button fc-button fc-button-primary ${mode === 'month' ? 'fc-button-active': ''}`}
              onClick={() => setMode('month')}
            >
              Monthly
            </button>
            <button
              className={`fc-resourceTimelineMonth-button fc-button fc-button-primary ${mode === 'week' ? 'fc-button-active': ''}`}
              onClick={() => setMode('week')}
            >
              Weekly
            </button>
            <button
              className={`fc-resourceTimelineMonth-button fc-button fc-button-primary ${mode === '2weeks' ? 'fc-button-active': ''}`}
              onClick={() => setMode('2weeks')}
            >
              Two Weeks
            </button>
            <button
              className={`fc-resourceTimelineMonth-button fc-button fc-button-primary ${mode === '6months' ? 'fc-button-active': ''}`}
              onClick={() => setMode('6months')}
            >
              6 months
            </button>
            <button
              className={`fc-resourceTimelineMonth-button fc-button fc-button-primary ${mode === 'year' ? 'fc-button-active': ''}`}
              onClick={() => setMode('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>
      <FullCalendar
        plugins={[interactionPlugin, resourceTimelinePlugin]}
        initialView="resourceTimeline"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        height="1300px"
        resourceAreaHeaderContent="Campaigns"
        resources={getResources(campaigns)}
        resourceGroupLabelContent={Campaign}
        events={events}
        eventContent={Event}
        resourcesInitiallyExpanded={false}
        slotDuration={slotDuration}
        duration={duration}
        slotLabelFormat={slotLabelFormat}
        resourceOrder="from"
        editable
        eventResourceEditable={false}
      />
    </div>
  );
};

export default GroupByCampaigns;
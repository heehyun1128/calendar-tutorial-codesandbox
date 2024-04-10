import { useState, useEffect, createRef } from 'react';
import moment from 'moment';
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from '@fullcalendar/interaction';

import { PHASES_COLORS } from './utils';

const getResources = (campaigns, mode) =>
  campaigns.map(
    (campaign) => ({
      ...campaign,
      children: (
        mode !== 'year'
        ? [{
            id: `sub-${campaign.id}`,
            name: 'Steps',
            type: 'steps',
          }]
        : null
      )
    })
  );

const getEvents = (campaigns) => campaigns.map(
  ({ id, name: campaignName, from: campaignFrom, to: campaignTo, members, steps }) => steps.map(({ id: eventId, name, from, to, phase }) => ({
    resourceId: `sub-${id}`,
    start: new Date(from),
    end: new Date(to),
    allDay: true,
    //color: PHASES_COLORS[phase],
    color: 'white',
    type: 'step',
    campaignId: id,
    name,
    phase,
    eventId,
  })).concat([{
    resourceId: id,
    start: new Date(campaignFrom),
    end: new Date(campaignTo),
    allDay: true,
    color: '#2C3E50',
    //color: 'white',
    type: 'campaign',
    name: campaignName,
    owner: members[0],
    integrator: members[1],
    campaignId: id,
  }])
).flat();

const TA = ({ label }) => {
  return (
    <span style={{
      backgroundColor: '#0868ac',
      borderRadius: 10,
      padding: 5,
      color: 'white',
      fontSize: 'small',
    }}>
      { label }
    </span>
  );
}

const CampaignResource = ({ resource }) => {
  const { name, from, to, type } = resource.extendedProps;
  if (type === 'steps') return <span>Steps</span>;
  return (
    <div style={{
      display: 'inline-flex',
      justifyContent: 'space-between',
      width: '100%',
      paddingRight: '20px'
    }}>
      <div>
        { name }
        &nbsp;
        <small>
          from { moment(from).format('DD/MM') } to { moment(to).format('DD/MM') }
        </small>
      </div>
      <div>
          <TA label={type} />
      </div>
    </div>
  );
};

const ModeSelector = ({ current, onChange }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px'}}>
      <div className="fc fc-direction-ltr">
        <div className="fc-button-group">
          <button
            className={`fc-button fc-button-primary ${current === 'week' ? 'fc-button-active' : ''}`}
            type="button"
            onClick={() => onChange('week')}
          >
            week
          </button>
          <button
            className={`fc-button fc-button-primary ${current === '2weeks' ? 'fc-button-active' : ''}`}
            type="button"
            onClick={() => onChange('2weeks')}
          >
            2 weeks
          </button>
          <button
            className={`fc-button fc-button-primary ${current === 'month' ? 'fc-button-active' : ''}`}
            type="button"
            onClick={() => onChange('month')}
          >
            month
          </button>
          <button
            className={`fc-button fc-button-primary ${current === 'year' ? 'fc-button-active' : ''}`}
            type="button"
            onClick={() => onChange('year')}
          >
            year
          </button>
        </div>
      </div>
    </div>
  )
};

const StepEvent = ({ name, phase }) => {
  return (
    <div title={`${name} (${phase})`}>
      { name }
    </div>
  );
};

const Avatar = ({ image, label }) => {

  return (
    <div
      title={label}
      style={{
        backgroundSize: 'cover',
        width: '20px',
        height: '20px',
        backgroundPosition: 'top center',
        borderRadius: '50%',
        marginRight: '5px',
        backgroundImage: `url(${image})`
      }}
    />
  )
};

const CampaignEvent = ({ name, owner, integrator }) => {
  return (
    <div style={{
      height: 50,
      padding: 5,
    }}>
      <div style={{ fontWeight: 600 }}>
        { name }
      </div>
      <div style={{
        display: 'flex',
        marginTop: 5,
      }}>
        <Avatar image={owner.picture} label={`${owner.name} (Owner)`} />
        <Avatar image={integrator.picture} label={`${integrator.name} (Integrator)`} />
      </div>
    </div>
  );
};

const Event = ({ event }) => {
  const { type, name, phase, owner, integrator } = event.extendedProps;
  const style = (
    type === 'campaign'
    ? {}
    : {
      border: `3px solid ${PHASES_COLORS[phase]}`,
      width: '100%',
      color: 'black',
      padding: 5,
    }
  );
  return (
    <div className="fc-event-title fc-sticky" style={style}>
      { type === 'campaign' && (
        <CampaignEvent {...{name, owner, integrator}} />
      )}
      { type === 'step' && (
        <StepEvent {...{name, phase}} />
      )}
    </div>
  );
};

const computeDurations = (mode) => {
  switch(mode) {
    case 'week':
      return {
        slotDuration: { days: 1 },
        slotLabelFormat: [{ month: 'long' }, { day: '2-digit' }],
        duration: { weeks: 1 },
      };
    case '2weeks':
      return {
        slotDuration: { days: 1 },
        slotLabelFormat: [{ month: 'long' }, { day: '2-digit' }],
        duration: { weeks: 2 },
      };
    case 'month':
      return {
        slotDuration: { days: 1 },
        slotLabelFormat: [{ day: '2-digit' }],
        duration: { months: 1 },
      };
    case 'year':
      return {
        slotDuration: { months: 1 },
        slotLabelFormat: [{ month: 'short' }, { day: '2-digit' }],
        duration: { years: 1 },
      };
    default: return {};
  }
};

const handleEventChange = (calendarRef, isResize) => ({ event, oldEvent, revert }) => {
  const { type, campaignId } = event.extendedProps;
  if (isResize && type === 'campaign') return revert();
  if (type === 'campaign') {
    // Campaign has been moved, compute diff and update each steps
    const diff = event.start.getTime() - oldEvent.start.getTime();
    calendarRef.current.getApi()
      .getEvents()
      .filter((currentEvent) => {
        const { type: currEventType, campaignId: currEventCampaignId } = currentEvent.extendedProps;
        return currEventType === 'step' && currEventCampaignId === campaignId;
      })
      .forEach((campaignEvent) => {
        const start = campaignEvent.start;
        const end = campaignEvent.end;
        campaignEvent.setDates(
          new Date(start.getTime() + diff),
          new Date(end.getTime() + diff),
        );
      });
  } else if (type === 'step') {
    // Step has been resized or move, update the campaign dates
    const campaignEvent = calendarRef.current.getApi().getEvents().find(({ extendedProps: evt }) => evt.type === 'campaign' && evt.campaignId === campaignId);
    const { first, last } = calendarRef.current.getApi()
      .getEvents()
      .filter((currentEvent) => {
        const { type: currEventType, campaignId: currEventCampaignId } = currentEvent.extendedProps;
        return currEventType === 'step' && currEventCampaignId === campaignId;
      })
      .reduce(
        (acc, evt) => {
          return {
            first: (acc.first === null || acc.first.start.getTime() > evt.start.getTime() ? evt : acc.first),
            last: (acc.last === null || acc.last.end.getTime() < evt.end.getTime() ? evt : acc.last),
          }
        },
        { first: null, last: null }
      );
    campaignEvent.setDates(first.start, last.end);
  }
};

const Calendar = ({ campaigns }) => {
  const [mode, setMode] = useState('month');
  const [resources, setResources] = useState([]);

  const calendarRef = createRef();

  useEffect(() => {
    setResources(getResources(campaigns, mode));
  }, [campaigns, mode]);

  const { duration, slotDuration, slotLabelFormat } = computeDurations(mode);

  return (
    <>
      <ModeSelector current={mode} onChange={setMode} />
      <FullCalendar
        ref={calendarRef}
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimeline"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        resourceAreaHeaderContent="Campaigns"
        resourcesInitiallyExpanded={false}
        resourceOrder="from"
        slotDuration={slotDuration}
        slotLabelFormat={slotLabelFormat}
        duration={duration}
        resources={resources}
        events={getEvents(campaigns)}
        resourceLabelContent={CampaignResource}
        eventContent={Event}
        editable={mode !== 'year'}
        eventResourceEditable={false}
        eventResize={handleEventChange(calendarRef, true)}
        eventDrop={handleEventChange(calendarRef, false)}
      />
    </>
  );
};

export default Calendar;
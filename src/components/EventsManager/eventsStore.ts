import { withImmer } from '@/store/middleware/withImmer'
import create, { GetState, SetState } from 'zustand'
import {
  StoreApiWithDevtools,
  StoreApiWithSubscribeWithSelector,
  subscribeWithSelector,
} from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { events } from './eventsData'
import type { Event } from './eventsTypes'

export type EventsState = {
  events: typeof events
  selectedEvent: Event['id']
  selectEvent: (id: string) => void
  createEvent: (event: Event) => void
}

export const useEventsStore = create<
  EventsState,
  SetState<EventsState>,
  GetState<EventsState>,
  StoreApiWithSubscribeWithSelector<EventsState> &
    StoreApiWithDevtools<EventsState>
>(
  devtools(
    subscribeWithSelector(
      withImmer((set) => ({
        events: [...events],
        selectEvent: (id: string) => {
          set({ selectedEvent: id })
        },
        createEvent: (event) => {
          set((state) => {
            state.events.push(event)
          })
        },
        selectedEvent: '',
      }))
    ),
    {
      name: 'Events',
    }
  )
)

export type UpcomingAndPastEventsState = {
  pastEvents: typeof events
  upcomingEvents: typeof events
}

export const useUpcomingAndPastEventsStore = create<
  UpcomingAndPastEventsState,
  SetState<UpcomingAndPastEventsState>,
  GetState<UpcomingAndPastEventsState>,
  StoreApiWithDevtools<UpcomingAndPastEventsState>
>(
  devtools(
    (set) => ({
      pastEvents: [],
      upcomingEvents: [],
    }),
    {
      name: 'UpcomingAndPastEvents',
    }
  )
)

useEventsStore.subscribe(
  (state) => state.events,
  (events) => {
    const upcomingEvents: Event[] = []
    const pastEvents: Event[] = []
    for (const event of events) {
      const [day, month, year] = event.endDate
        .split('/')
        .map((item) => parseInt(item))
      const [hour, minute] = event.endTime.split(':')
      const isUpcoming =
        new Date(year, month - 1, day, parseInt(hour), parseInt(minute)) >
        new Date()

      if (isUpcoming) {
        upcomingEvents.push(event)
      } else {
        pastEvents.push(event)
      }
    }

    useUpcomingAndPastEventsStore.setState({
      pastEvents,
      upcomingEvents,
    })
  },
  { fireImmediately: true }
)
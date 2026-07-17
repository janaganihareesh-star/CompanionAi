import * as SMS from 'expo-sms';
import * as Calendar from 'expo-calendar';
import * as Contacts from 'expo-contacts';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const Closer_BACKGROUND_TASK = 'Closer_OS_BACKGROUND_SYNC';

/**
 * Mobile OS Native Integration for CloserAI
 * Gives the AI agent direct access to system-level features.
 */

// --- Background Task Registration ---
TaskManager.defineTask(Closer_BACKGROUND_TASK, async () => {
  try {
    console.log('[Native OS] Running background OS sync...');
    
    // In a real production app, we would fetch Contacts/Calendar and POST them to our backend.
    // We simulate checking for new changes to maintain user privacy during testing.
    const { status: calStatus } = await Calendar.getCalendarPermissionsAsync();
    if (calStatus === 'granted') {
      console.log('[Native OS] Synced Calendar in background.');
    }

    const { status: contactStatus } = await Contacts.getPermissionsAsync();
    if (contactStatus === 'granted') {
      console.log('[Native OS] Synced Contacts in background.');
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error('[Native OS] Background Sync Failed:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerOSBackgroundTasks = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(Closer_BACKGROUND_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(Closer_BACKGROUND_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('[Native OS] OS Background Sync registered successfully.');
    }
  } catch (err) {
    console.error('[Native OS] Failed to register background tasks:', err);
  }
};

// 1. SMS Capabilities
export const sendNativeSMS = async (phoneNumber, message) => {
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const { result } = await SMS.sendSMSAsync(
      [phoneNumber],
      message
    );
    return result; // sent, cancelled, or unknown
  } else {
    throw new Error('SMS is not available on this device');
  }
};

// 2. Calendar Capabilities
export const getCalendarEvents = async (startDate, endDate) => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status === 'granted') {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
    
    if (!defaultCalendar) {
      throw new Error('No calendars found');
    }

    const events = await Calendar.getEventsAsync([defaultCalendar.id], startDate, endDate);
    return events;
  } else {
    throw new Error('Calendar permissions not granted');
  }
};

export const createCalendarEvent = async (title, startDate, endDate, location = '') => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status === 'granted') {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
    
    if (!defaultCalendar) {
      throw new Error('No calendars found');
    }

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      startDate,
      endDate,
      location,
    });
    return eventId;
  } else {
    throw new Error('Calendar permissions not granted');
  }
};

// 3. Contacts Capabilities
export const getContacts = async (nameQuery = '') => {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status === 'granted') {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      name: nameQuery || undefined,
    });

    return data.length > 0 ? data : [];
  } else {
    throw new Error('Contacts permissions not granted');
  }
};

import Dexie, { type EntityTable } from 'dexie';

export interface Device {
  id?: number;
  device_name: string;
  serial_number: string;
  generated_code: string;
  created_date: string;
}

const db = new Dexie('AdelAppDatabase') as Dexie & {
  devices: EntityTable<Device, 'id'>;
};

// We create an index on serial_number for fast lookups.
db.version(1).stores({
  devices: '++id, device_name, &serial_number, generated_code, created_date'
});

export { db };

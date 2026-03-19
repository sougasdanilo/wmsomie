// src/controllers/locationController.js
import Location from '../models/Location.js';
import { 
  createLocation, 
  searchLocations, 
  getLocationsByZone, 
  isLocationAvailable,
  toggleLocationStatus,
  getNearbyLocations
} from '../services/locationService.js';

export async function createLocationController(req, res) {
  try {
    const location = await createLocation(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


export async function getLocations(req, res) {
  try {
    const { zone, search, sortBy = 'code' } = req.query;
    
    let locations;
    if (search) {
      locations = await searchLocations(search);
    } else if (zone) {
      locations = await getLocationsByZone(zone);
    } else {
      locations = await Location.find({ isActive: true }).sort({ code: 1 });
    }
    
    res.json(locations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getLocationByCode(req, res) {
  try {
    const { code } = req.params;
    const location = await Location.findOne({ code, isActive: true });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


export async function checkLocationAvailability(req, res) {
  try {
    const { code } = req.params;
    const available = await isLocationAvailable(code);
    res.json({ available, code });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateLocationStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const location = await toggleLocationStatus(id, isActive);
    res.json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getLocationsNearby(req, res) {
  try {
    const { code } = req.params;
    const { radius = 5 } = req.query;
    const locations = await getNearbyLocations(code, parseInt(radius));
    res.json(locations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


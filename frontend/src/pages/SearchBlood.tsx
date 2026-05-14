import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, MapPin, Phone, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { getInventory } from '../services/api/inventory';
import { addRequest } from '../services/api/requests';
import { BloodType, Hospital } from '../types';
import { toast } from 'sonner';
import L from 'leaflet';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map view when selected hospital changes
const MapUpdater = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center as L.LatLngExpression, 13, {
      animate: true,
    });
  }, [center, map]);
  return null;
};

export const SearchBlood = () => {
  const { user } = useAuth();
  const [bloodType, setBloodType] = useState<BloodType | 'ALL'>('ALL');
  const [distance, setDistance] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<
    {
      hospital: Partial<Hospital>;
      units: number;
      distance: number;
      id: string;
    }[]
  >([]);
  const [selectedHospital, setSelectedHospital] = useState<Partial<Hospital> | null>(
    null
  );

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (bloodType !== 'ALL') params.bloodType = bloodType;
      
      // Use user's hospital location for geo search if available
      if (user?.lat !== undefined && user?.lng !== undefined) {
        params.lat = user.lat;
        params.lng = user.lng;
        params.distance = distance;
      }
      
      const inventory = await getInventory(params);
      
      // Group by hospital
      const grouped: Record<string, any> = {};
      inventory.forEach(item => {
        if (!grouped[item.hospitalName]) {
          grouped[item.hospitalName] = {
            hospital: {
              name: item.hospitalName,
              address: item.hospital?.address || item.location?.address || 'Unknown Address',
              lat: item.hospital?.lat !== undefined ? item.hospital.lat : (item.location?.coordinates[1] || 7.8731),
              lng: item.hospital?.lng !== undefined ? item.hospital.lng : (item.location?.coordinates[0] || 80.7718),
              contact: item.hospital?.phone || 'Contact not provided'
            },
            units: 0,
            id: item.id,
            hospitalId: item.hospitalId
          };
        }
        grouped[item.hospitalName].units += item.units;
      });

      const found = Object.values(grouped).map(item => {
        let dist = 0;
        if (user?.lat !== undefined && user?.lng !== undefined && item.hospital.lat !== undefined && item.hospital.lng !== undefined) {
          dist = calculateDistance(user.lat, user.lng, item.hospital.lat, item.hospital.lng);
        }
        return { ...item, distance: dist };
      }).sort((a, b) => a.distance - b.distance);

      setResults(found);
      if (found.length > 0) {
        setSelectedHospital(found[0].hospital);
      } else {
        setSelectedHospital(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRequest = async (hospital: any, units: number) => {
    try {
      await addRequest({
        targetHospital: hospital.name,
        targetHospitalId: hospital.hospitalId,
        bloodType: bloodType === 'ALL' ? 'O+' : bloodType as BloodType,
        units: units,
        urgency: 'NORMAL',
        message: `Emergency request from ${user?.hospitalName}`
      });
      toast.success('Request sent successfully!');
    } catch (error) {
      toast.error('Failed to send request');
      console.error(error);
    }
  };

  const defaultCenter: [number, number] = user?.lat !== undefined && user?.lng !== undefined ? [user.lat, user.lng] : [7.8731, 80.7718];
  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blood Locator</h1>
        <p className="text-gray-500">
          Find available blood units in nearby hospitals.
        </p>
      </div>

      <Card className="shrink-0">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={bloodType}
              onChange={(e) =>
                setBloodType(e.target.value as BloodType | 'ALL')
              }>
              <option value="ALL">All Types</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="flex-1 w-full">
            <Input
              label="Radius (km)"
              placeholder="e.g. 10"
              type="number"
              icon={<MapPin size={18} />}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <Button
            size="lg"
            className="w-full md:w-auto"
            leftIcon={<Search size={18} />}
            onClick={handleSearch}>
            Search
          </Button>
        </div>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Results List */}
        <div className="lg:col-span-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              No blood units found for this criteria.
            </div>
          ) : (
            results.map(({ hospital, units, distance: dist, id }) => (
              <Card
                key={id}
                className={`cursor-pointer transition-all ${
                  selectedHospital?.name === hospital.name
                    ? 'border-red-500 ring-1 ring-red-500'
                    : 'hover:border-red-200'
                }`}
                onClick={() => setSelectedHospital(hospital)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {hospital.name}
                  </h3>
                  <Badge variant="success">{units} Units</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <MapPin
                  size={16}
                  className="shrink-0 mt-0.5 text-gray-400" />
                
                    {hospital.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {hospital.contact}
                  </p>
                  {/* <p className="flex items-center gap-2 text-red-600 font-medium">
                    <Navigation size={16} />~
                    {dist.toFixed(1)} km away
                  </p> */}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleRequest(hospital, units)}>
                    Request Blood
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Map View */}
        <Card
          noPadding
          className="lg:col-span-2 relative h-[400px] lg:h-full overflow-hidden z-0">
          
          <MapContainer
            center={
              (selectedHospital?.lat !== undefined && selectedHospital?.lng !== undefined
                ? [selectedHospital.lat, selectedHospital.lng]
                : defaultCenter) as L.LatLngExpression
            }
            zoom={12}
            scrollWheelZoom={true}
            style={{
              height: '100%',
              width: '100%',
            }}>
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {selectedHospital && selectedHospital.lat !== undefined && selectedHospital.lng !== undefined && (
              <MapUpdater
                center={[selectedHospital.lat!, selectedHospital.lng!] as L.LatLngExpression}
              />
            )}
            {results.map(({ hospital, units, id }) => (
              hospital.lat !== undefined && hospital.lng !== undefined && (
                <Marker key={id} position={[hospital.lat!, hospital.lng!] as L.LatLngExpression}>
                  <Popup>
                    <div className="font-semibold">{hospital.name}</div>
                    <div className="text-red-600">{units} Units Available</div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </Card>
      </div>
    </div>);

};
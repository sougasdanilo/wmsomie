// ui/src/pages/Locations.jsx
import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Save, X, Search, Trash2, Eye } from 'lucide-react';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newLocation, setNewLocation] = useState({ code: '', description: '', zone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [groupedView, setGroupedView] = useState(false);
  const [groupedLocations, setGroupedLocations] = useState({});

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(location => 
      location.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.aisle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [locations, searchTerm]);

  const loadLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data || []);
      
      // Carregar dados agrupados
      const groupedResponse = await fetch('/api/locations/grouped');
      const groupedData = await groupedResponse.json();
      setGroupedLocations(groupedData || {});
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocation.code) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      });
      
      if (response.ok) {
        await loadLocations();
        setNewLocation({ code: '', description: '', zone: '' });
      }
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSequence = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/locations/sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startCode: 'AA1',
          quantity: 10,
          zone: 'Principal',
          descriptionTemplate: 'Endereço {code}'
        })
      });
      
      if (response.ok) {
        await loadLocations();
      }
    } catch (error) {
      console.error('Error creating sequence:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateLocation = async (id) => {
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      });
      
      if (response.ok) {
        await loadLocations();
        setEditing(null);
        setNewLocation({ code: '', description: '', zone: '' });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      const response = await fetch(`/api/locations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (response.ok) {
        await loadLocations();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciamento de Localizações</h1>
      
      {/* Controles */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Localizações do Armazém</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setGroupedView(!groupedView)}
              className={`px-4 py-2 rounded-lg ${
                groupedView 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {groupedView ? 'Visão Agrupada' : 'Visão Lista'}
            </button>
            <button
              onClick={handleCreateSequence}
              disabled={creating}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {creating ? 'Criando...' : 'Criar Sequência'}
            </button>
          </div>
        </div>

        {/* Busca e Nova Localização */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            placeholder="Código (ex: AA1)"
            value={newLocation.code}
            onChange={(e) => setNewLocation({...newLocation, code: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={newLocation.description}
            onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Zona"
            value={newLocation.zone}
            onChange={(e) => setNewLocation({...newLocation, zone: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateLocation}
            disabled={creating || !newLocation.code}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de Localizações */}
      {!groupedView ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corredor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLocations.map((location) => (
                  <tr key={location._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{location.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.aisle || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.position || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.zone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        location.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(location._id, !location.isActive)}
                          className={`${
                            location.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLocations.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma localização encontrada</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLocations).map(([aisle, aisleLocations]) => (
            <div key={aisle} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Corredor {aisle}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {aisleLocations.map((location) => (
                  <div 
                    key={location._id} 
                    className={`border rounded-lg p-3 text-center ${
                      location.isActive 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{location.code}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {location.zone || 'Sem zona'}
                    </div>
                    <div className="text-xs mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        location.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(groupedLocations).length === 0 && (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma localização encontrada</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const EventCalendar = ({ navigation, user }) => {
  const [events, setEvents] = useState([]);
  const [selectedView, setSelectedView] = useState('dayGridMonth');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.titulo,
        start: event.fechaInicio,
        end: event.fechaFin,
        backgroundColor: getCategoryColor(event.EventCategory),
        extendedProps: {
          description: event.descripcion,
          location: event.space?.nombre,
          artist: event.artist?.nombreArtistico,
          price: event.precio,
          category: event.EventCategory
        }
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const getCategoryColor = (category) => {
    return category?.color || '#95A5A6';
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });

    // Actualizar el calendario vía WebView
    webViewRef.current.injectJavaScript(`
      calendar.getEvents().forEach(event => {
        const shouldShow = ${JSON.stringify(selectedCategories)}.length === 0 || 
                         ${JSON.stringify(selectedCategories)}.includes(event.extendedProps.category);
        event.setProp('display', shouldShow ? 'auto' : 'none');
      });
      true;
    `);
  };

  const webViewRef = React.useRef(null);

  const calendarHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/core/main.css' rel='stylesheet' />
        <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid/main.css' rel='stylesheet' />
        <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid/main.css' rel='stylesheet' />
        <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/list/main.css' rel='stylesheet' />
        <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core/main.js'></script>
        <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid/main.js'></script>
        <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid/main.js'></script>
        <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/list/main.js'></script>
        <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/interaction/main.js'></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          #calendar {
            height: 100%;
            padding: 10px;
          }
          .fc-event {
            cursor: pointer;
            border-radius: 4px;
            margin: 2px 0;
          }
          .fc-event-title {
            white-space: normal;
            padding: 2px 4px;
          }
          .fc-toolbar-title {
            font-size: 1.2em !important;
          }
          .fc-event-location {
            font-size: 0.8em;
            opacity: 0.7;
            padding: 0 4px 2px;
          }
          .fc-list-event-title {
            font-weight: bold;
          }
          .fc-list-event-location {
            color: #666;
            font-size: 0.9em;
          }
          .fc-toolbar-chunk {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .fc-button {
            padding: 6px 12px !important;
            font-size: 0.9em !important;
          }
        </style>
      </head>
      <body>
        <div id='calendar'></div>
        <script>
          var calendar;
          document.addEventListener('DOMContentLoaded', function() {
            var calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
              plugins: ['dayGrid', 'timeGrid', 'list', 'interaction'],
              initialView: '${selectedView}',
              headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
              },
              views: {
                listWeek: {
                  buttonText: 'Agenda'
                }
              },
              locale: 'es',
              events: ${JSON.stringify(events)},
              eventClick: function(info) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: info.event.id
                }));
              },
              dateClick: function(info) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'dateClick',
                  date: info.dateStr
                }));
              },
              eventContent: function(arg) {
                if (arg.view.type === 'listWeek') {
                  return {
                    html: '<div class="fc-list-event-title">' + arg.event.title + '</div>' +
                          '<div class="fc-list-event-location">' +
                          (arg.event.extendedProps.location || 'Ubicación por confirmar') +
                          '</div>'
                  }
                }
                return {
                  html: '<div class="fc-content">' +
                        '<div class="fc-event-title">' + arg.event.title + '</div>' +
                        '<div class="fc-event-location">' +
                        (arg.event.extendedProps.location || 'Ubicación por confirmar') +
                        '</div>' +
                        '</div>'
                }
              }
            });
            calendar.render();
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'eventClick') {
        navigation.navigate('EventDetail', { eventId: data.eventId });
      } else if (data.type === 'dateClick' && (user?.role === 'artist' || user?.role === 'admin')) {
        navigation.navigate('CreateEvent', { date: data.date });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por Categoría</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategories.includes(category.id) && styles.selectedCategory
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={[
                styles.categoryText,
                selectedCategories.includes(category.id) && styles.selectedCategoryText
              ]}>
                {category.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: calendarHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
      
      {/* Botón de filtros */}
      <TouchableOpacity
        style={[styles.floatingButton, styles.filterButton]}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="filter" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Botón de crear evento (solo para artistas y admin) */}
      {(user?.role === 'artist' || user?.role === 'admin') && (
        <TouchableOpacity
          style={[styles.floatingButton, styles.createButton]}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  webview: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterButton: {
    backgroundColor: '#4A90E2',
    right: 16,
    bottom: 88,
  },
  createButton: {
    backgroundColor: '#2ECC71',
    right: 16,
    bottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedCategory: {
    backgroundColor: '#E8F0FE',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
  },
});

export default EventCalendar;

//From: https://wrightshq.com/playground/placing-multiple-markers-on-a-google-map-using-api-3/
jQuery(function($) {
    // Asynchronously Load the map API 
    var script = document.createElement('script');
    script.src = "//maps.googleapis.com/maps/api/js?&sensor=false&callback=initialize";
    document.body.appendChild(script);
});

function makeMarkerImage(specifier) {
    url = 'https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/' +
          'master/images/marker_' + specifier + '.png';
    return(url);
}

function initialize() {
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };
                    
    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);
    var markers = [
        {'name': 'Hesperiden garden',
         'location': [49.079693, 12.159665],
         'info': "This is where the wedding is on Friday.",
         'icon': "purpleA"
        },
        {'name': "Frido's parents' house",
         'location': [48.984140, 12.133073],
         'info': 'Base camp and brunch location for' +
                 'Saturday',
         'icon': "redB"
        },
        {'name': 'Hotel Luis',
         'location': [49.013975, 12.107465],
         'info': 'One of our suggested hotels. Check out the ' +
                 '<a href="/wdng/en_hotels.html">hotels page</a>' + 
                 ' for more information.',
         'icon': "orangeH"
        },
        {'name': 'Hotel VIII',
         'location': [49.020275, 12.101285],
         'info': 'One of our suggested hotels. Check out the ' +
                 '<a href="/wdng/en_hotels.html">hotels page</a>' + 
                 ' for more information.',
         'icon': "greenH"
        },
        {'name': 'Private Accomodations',
         'location': [48.985414, 12.139722],
         'info': "There are a few rooms with friends of Frido's parents in" +
                 'this general area. Check out the ' +
                 '<a href="/wdng/en_hotels.html">hotels page</a>' + 
                 ' for more information.',
         'icon': "greyH"
        },
        {'name': 'Star Inn Hotel',
         'location': [49.012546, 12.102309],
         'info': 'One of our suggested hotels. Check out the ' +
                 '<a href="/wdng/en_hotels.html">hotels page</a>' + 
                 ' for more information.',
         'icon': "blueH"
        }
    ];
       
    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    // Loop through our array of markers & place each one on the map  
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i]['location'][0], 
                                              markers[i]['location'][1]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i]['name'],
            icon: makeMarkerImage(markers[i]['icon'])
        });
        
        // Allow each marker to have an info window    
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                var content = '<div class="info_content">' + 
                              '<h5>' + markers[i]['name'] + '</h5>' +
                              '<p>' + markers[i]['info'] + '</p>' +
                              '</div>';
                console.log(content);
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            }
        })(marker, i));

        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(11);
        google.maps.event.removeListener(boundsListener);
    });
    
}


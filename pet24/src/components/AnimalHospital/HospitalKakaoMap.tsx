import React, { useState, useEffect } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import { KakaoMap } from "./KakaoMap";


export const HospitalKakaoMap = () => {
  const { kakao } = window;
  const [ mapState, setMapState ] = useState({
    center: {
        lat: 0, 
        lng: 0,
    },
    errMas: null,
    isLoading: true
});
  const [info, setInfo] = useState({content:""})
  const [markers, setMarkers]: any = useState([])
  const [map, setMap]:any  = useState()
  const [searchInputValue, setSearchInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [province, setProvince] = useState('');
  

  useEffect(()=>{
    getCurrentCoordinate().then(()=>{
      const container: any = document.getElementById('map');
      console.log(mapState.center.lat)
      console.log(mapState.center.lng)
      const options = {
        center: new kakao.maps.LatLng(mapState.center.lat, mapState.center.lng),
        level: 5
      };
      const map = new kakao.maps.Map(container, options);
      console.log(map)

      // keyword 임시 셋팅
      setKeyword('동물병원');
    })
    

}, []);



console.log(mapState)
console.log(map)



const getCurrentCoordinate = async () => {
    console.log("getCurrentCoordinate 함수 실행!!!");
    return new Promise((res, rej) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          console.log(position);
          const lat = position.coords.latitude; // 위도
          const lon = position.coords.longitude; // 경도

          
          const coordinate = new kakao.maps.LatLng(lat, lon);
          res(coordinate);
          setMapState((prev)=> ({
                            ...prev,
                            center: {
                                lat: lat,
                                lng: lon
                            }
                          }));
        });
      } else {
        rej(new Error("현재 위치를 불러올 수 없습니다."));
      }
    });
  };


  useEffect(() => {
      if (!map) return
      const ps = new kakao.maps.services.Places()
  
      ps.keywordSearch(`${keyword}`, (data: any, status: any, _pagination: any) => {
        if (status === kakao.maps.services.Status.OK) {
          // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
          // LatLngBounds 객체에 좌표를 추가합니다
          const bounds = new kakao.maps.LatLngBounds()
          let markers = []
  
          console.log(data)
          for (var i = 0; i < data.length; i++) {
            markers.push({
              position: {
                lat: data[i].y,
                lng: data[i].x,
              },
              content: data[i].place_name,
            })
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
          }
          console.log(markers)
          setMarkers(markers)
  
          // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
          map.setBounds(bounds)
        }
      },{
        radius : 3000,
        location: new kakao.maps.LatLng(mapState.center.lat, mapState.center.lng)
      })
    }, [keyword])
  
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") setKeyword(searchInputValue);
  };

  return (
    <Map // 로드뷰를 표시할 Container
      id="map"
      center={{
        lat: mapState.center.lat,
        lng: mapState.center.lng,
      }}
      style={{
        width: "100%",
        height: "800px",
      }}
      level={3}
      onCreate={setMap}
    >
      {markers.map((marker: any) => (
        <MapMarker
          key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
          position={marker.position}
          onClick={() => setInfo(marker)}
        >
          {info &&info.content === marker.content && (
            <div style={{color:"#000"}}>{marker.content}</div>
          )}
        </MapMarker>
      ))}
      <input onClick={handleKeyPress}></input>
    </Map>
  )
}
<template>
    <div class="Container">
        <!--地圖呈現在此-->
      <div class="google-map" id="map"></div>
      <div class="search">
        <h3 >請輸入餐廳名稱</h3>
        <input type='text' class='form-control form-label' id="search_Input" ref="searchrestaurant" v-model="inputValue"/>
        <button class='btn btn-primary' @click="add()">加入餐廳選擇</button>

        <h4 class="restaurant-title">餐廳候補</h4>
          <ol class="list-group list-group-numbered">
            <li
              class="list-group-item"
              v-for="(item, index) in favoriteRestaurant"
              :key="index">{{item}}
              <button type="button" class="btn btn-primary" @click="remove(index)">刪除</button>
              </li>
          </ol>

        <buttom class="btn btn-primary btnlots" @click="drawlots()">抽選</buttom>
        <div class="result" v-if="draws">{{favoriteRestaurant[number]}}</div>
      </div>
    </div>
</template>
<script >
import { ref, onMounted } from 'vue'
export default {
  name: 'app-restaurant',
  setup () {
    let map
    const lat = 23.553118
    const lng = 121.0211024
    let currentPosition
    const searchrestaurant = ref()
    let selectedRestaurant
    let marker
    let directionService
    let directionRenderer
    let infowindow
    const favoriteRestaurant = ref([])
    const inputValue = ref()
    const number = ref()
    const draws = ref(false)

    const drawlots = function () {
      number.value = Math.floor(Math.random() * favoriteRestaurant.value.length)
      draws.value = true
    }

    const restaurantList = JSON.parse(localStorage.getItem('restaurantList')) || []
    restaurantList.forEach(function (restaurant) {
      favoriteRestaurant.value.push(restaurant.name)
    })

    const remove = function (index) {
      favoriteRestaurant.value.splice(index, 1)
      const removeName = JSON.parse(localStorage.restaurantList.trim())
      console.log(removeName[index].name)
      const restaurantList = JSON.parse(localStorage.getItem('restaurantList')) || []
      const removerestaurant = restaurantList.filter(restaurant =>
        restaurant.name !== removeName[index].name
      )
      console.log(removerestaurant)
      localStorage.setItem('restaurantList', JSON.stringify(removerestaurant))

      draws.value = false
    }
    const add = function () {
      if (inputValue.value.trim()) {
        favoriteRestaurant.value.push(selectedRestaurant.name)
        inputValue.value = ''

        const restaurantList = JSON.parse(localStorage.getItem('restaurantList')) || []
        restaurantList.push(selectedRestaurant)
        localStorage.setItem('restaurantList', JSON.stringify(restaurantList))
      }
      draws.value = false
    }
    const initMap = function () {
      map = new window.google.maps.Map(document.getElementById('map'), {
        // 設定地圖的中心點經緯度位置
        center: { lat: lat, lng: lng },
        // 設定地圖縮放比例 0-20
        zoom: 7,
        // 限制使用者能縮放地圖的最大比例
        maxZoom: 20,
        // 限制使用者能縮放地圖的最小比例
        minZoom: 3,
        // 設定是否呈現右下角街景小人
        streetViewControl: false,
        // 設定是否讓使用者可以切換地圖樣式：一般、衛星圖等
        mapTypeControl: false
      })
      navigator.geolocation.getCurrentPosition(function (position) {
        currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        map.setCenter(currentPosition)
        map.setZoom(16)
        const autocomplete = new window.google.maps.places.Autocomplete(
          searchrestaurant.value,
          {
            types: ['restaurant'],
            bounds: {
              east: currentPosition.lng + 0.001,
              west: currentPosition.lng - 0.001,
              south: currentPosition.lat - 0.001,
              north: currentPosition.lat + 0.001
            },
            strictBounds: false
          }
        )
        autocomplete.bindTo('bounds', map)
        autocomplete.addListener('place_changed', function () {
          const place = autocomplete.getPlace()

          selectedRestaurant = {
            location: place.geometry.location,
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phoneNumber: place.formatted_phone_number,
            rating: place.rating
          }
          map.setCenter(selectedRestaurant.location)

          if (!marker) {
            marker = new window.google.maps.Marker({
              map: map
            })
          }
          marker.setPosition(selectedRestaurant.location)

          if (!directionService) {
            directionService = new window.google.maps.DirectionsService()
          }

          if (!directionRenderer) {
            directionRenderer = new window.google.maps.DirectionsRenderer({
              map: map
            })
          }
          directionRenderer.set('direction', null)

          directionService.route({
            origin: new window.google.maps.LatLng(
              currentPosition.lat,
              currentPosition.lng
            ),
            destination: {
              placeId: selectedRestaurant.placeId
            },
            travelMode: 'WALKING'
          },
          function (response, status) {
            if (status === 'OK') {
              directionRenderer.setDirections(response)
              if (!infowindow) {
                infowindow = new window.google.maps.InfoWindow()
              }
              infowindow.setContent(
                `
                <h3>${selectedRestaurant.name}</h3>
                <div>地址：${selectedRestaurant.address}</div>
                <div>電話：${selectedRestaurant.phoneNumber}</div>
                <div>評分：${selectedRestaurant.rating}</div>
                <div>步行時間：${response.routes[0].legs[0].duration.text}</div>
                `
              )
              infowindow.open(map, marker)
            }
          })
        })
      })
    }
    onMounted(() => {
      initMap()
    })

    return { draws, number, map, lat, lng, searchrestaurant, add, favoriteRestaurant, inputValue, remove, drawlots }
  }
}
</script>
<style lang='scss' scoped>
@import "../../node_modules/bootstrap/scss/_functions";
@import "../../node_modules/bootstrap/scss/variables";
@import "../../node_modules/bootstrap/scss/_mixins";
@import "../../node_modules/bootstrap/scss/bootstrap";

  .Container {
    display: flex;
  }
  .restaurant-title{
    margin-top:0.8rem;
  }
  .btn-primary {
    height: 2rem;
    font-size: 1rem;
    line-height: 1rem;
  }
  .form-control {
    width: 17rem;
  }
  .google-map {
    width: 70%;
    height: 100vh;
  }
  .search {
    margin : 2rem 0 0 3rem;
  }
  .btnlots{
    margin: 1rem 0;
  }

</style>

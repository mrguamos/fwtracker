<template>
  <v-app>
    <v-app-bar app color="black" dark>
      <div class="d-flex align-center">
        <router-link to="/">
          <v-img
            alt="Logo"
            contain
            src="/img/folk.png"
            transition="scale-transition"
            width="120"
          />
        </router-link>
      </div>
    </v-app-bar>
    <v-main>
      <VuePullRefresh :on-refresh="onRefresh" :config="config">
        <v-container class="py-16" fluid>
          <router-view />
        </v-container>
      </VuePullRefresh>
    </v-main>
    <v-footer color="primary lighten-1" padless>
      <v-row justify="center" no-gutters>
        <v-col class="primary lighten-2 py-4 text-center white--text" cols="12">
          {{ new Date().getFullYear() }} —
          <strong
            >Powered by
            <a href="https://github.com/mrguamos" target="_blank"
              >iSkramz</a
            ></strong
          >
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { provide } from '@vue/composition-api'
import Web3 from 'web3'
import {
  Characters,
  charAddress,
  folkAddress,
  IERC20,
  FolkWarriors,
  mainAddress,
  Weapons,
  weaponAddress,
  rpc,
  rpcWS,
  IStakingRewards,
  stakingAddress,
} from './contracts/contracts'
import VuePullRefresh from 'vue-pull-refresh'

export default defineComponent({
  components: {
    VuePullRefresh,
  },
  setup() {
    const config = {
      errorLabel: 'Error while reloading...',
      startLabel: 'Pull to refresh...',
      readyLabel: 'Release to update...',
      loadingLabel: 'Loading...',
      pullDownHeight: 150,
    }

    function onRefresh() {
      return new Promise(function () {
        setTimeout(function () {
          window.location.reload()
        }, 100)
      })
    }

    const options = {
      reconnect: {
        auto: true,
      },
    }
    const provider = new Web3.providers.WebsocketProvider(rpcWS, options)
    const web3ws = new Web3(provider)
    provide('web3ws', web3ws)
    const web3 = new Web3(rpc)
    provide('web3', web3)
    const character = new web3.eth.Contract(Characters as any, charAddress)
    provide('character', character)
    const folk = new web3.eth.Contract(IERC20 as any, folkAddress)
    provide('folk', folk)
    const folkwarriors = new web3.eth.Contract(FolkWarriors as any, mainAddress)
    provide('folkwarriors', folkwarriors)
    const weapon = new web3.eth.Contract(Weapons as any, weaponAddress)
    provide('weapon', weapon)
    const folkwarriorsWS = new web3ws.eth.Contract(
      FolkWarriors as any,
      mainAddress
    )
    provide('folkwarriorsWS', folkwarriorsWS)
    const staking = new web3.eth.Contract(
      IStakingRewards as any,
      stakingAddress
    )
    provide('staking', staking)
    return { onRefresh, config }
  },
})
</script>
<style lang="scss">
@media (max-width: 1200px) {
  .short-address {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 200px;
  }
}
</style>

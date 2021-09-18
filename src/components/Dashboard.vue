<template>
  <div>
    <v-row justify="center">
      <v-col cols="6" sm="6" md="4">
        <Card :content="totalFolk" :title="'Total Folk'" />
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <Card :content="walletFolk" :title="'Total Folk in Wallet'" />
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <Card :content="totalUnclaimedFolk" :title="'Total Unclaimed'" />
      </v-col>

      <v-col cols="6" sm="6" md="4">
        <Card :content="totalStaked" :title="'Total Staked'" />
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <Card :content="totalBNB" :title="'Total BNB'" />
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <Card :content="`$${totalFolkUSD}`" :title="'Total Folk / USD'" />
      </v-col>

      <v-col cols="6" sm="6" md="4">
        <Card :content="`$${bnbUSD}`" :title="'BNB / USD'" />
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <Card :content="`$${folkUSD}`" :title="'Folk / USD'" />
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <Card :content="`$${totalBNBUSD}`" :title="'Total BNB / USD'" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Card from './Card.vue'
import { useAccounts } from '../store/accounts'
import axios from 'axios'

export default defineComponent({
  components: { Card },
  setup() {
    const { accounts } = useAccounts()
    const walletFolk = computed(() => {
      let total = 0
      accounts.value.map((item) => {
        if (!isNaN(item.walletFolk)) {
          total = total + item.walletFolk
        }
      })
      return `${total.toFixed(4)}`
    })
    const totalFolk = computed(() =>
      (
        Number(totalUnclaimedFolk.value) +
        Number(walletFolk.value) +
        Number(totalStaked.value)
      ).toFixed(4)
    )
    const totalUnclaimedFolk = computed(() => {
      let total = 0
      accounts.value.map((item) => {
        if (!isNaN(item.unclaimedFolk)) {
          total = total + item.unclaimedFolk
        }
      })
      return `${total.toFixed(4)}`
    })
    const totalStaked = computed(() => {
      let total = 0
      accounts.value.map((item) => {
        if (!isNaN(item.stakedFolk)) {
          total = total + item.stakedFolk
        }
      })
      return `${total.toFixed(4)}`
    })
    const totalBNB = computed(() => {
      let total = 0
      accounts.value.map((item) => {
        if (!isNaN(item.walletBNB)) {
          total = total + item.walletBNB
        }
      })
      return `${total.toFixed(4)}`
    })

    const totalFolkUSD = computed(() => {
      return (Number(totalFolk.value) * Number(folkUSD.value)).toFixed(4)
    })

    const totalBNBUSD = computed(() => {
      return (Number(totalBNB.value) * Number(bnbUSD.value)).toFixed(4)
    })

    const folkUSD = ref('0')
    const bnbUSD = ref('0')

    async function getFolkUSD() {
      try {
        const response = await axios.get(
          'https://api.1inch.exchange/v3.0/56/quote?fromTokenAddress=0x492793a9ed1ac780cbd6b56c930461bc3c568f47&toTokenAddress=0x55d398326f99059ff775485246999027b3197955&amount=1000000000000000000'
        )
        let value: number = response.data.toTokenAmount
        value /= Math.pow(10, 18)
        folkUSD.value = value.toFixed(4)
      } catch (error) {
        console.log(error)
      } finally {
        setTimeout(getFolkUSD, 5000)
      }
    }

    getFolkUSD()

    async function getBNBUSD() {
      try {
        const response = await axios.get(
          'https://api.1inch.exchange/v3.0/56/quote?fromTokenAddress=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&toTokenAddress=0x55d398326f99059ff775485246999027b3197955&amount=1000000000000000000'
        )
        let value: number = response.data.toTokenAmount
        value /= Math.pow(10, 18)
        bnbUSD.value = value.toFixed(4)
      } catch (error) {
        console.log(error)
      } finally {
        setTimeout(getBNBUSD, 5000)
      }
    }

    getBNBUSD()

    return {
      totalStaked,
      totalFolk,
      totalUnclaimedFolk,
      walletFolk,
      totalBNB,
      folkUSD,
      bnbUSD,
      totalFolkUSD,
      totalBNBUSD,
    }
  },
})
</script>

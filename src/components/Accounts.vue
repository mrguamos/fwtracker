<template>
  <div>
    <v-card class="mx-auto">
      <v-card-title>Accounts</v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="account.address"
              label="Address"
              clearable
              required
              name="address"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="5">
            <v-text-field
              v-model="account.name"
              label="Account Name"
              clearable
              required
              name="name"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" md="4">
            <v-btn block color="primary" @click="addAccount()"> Submit </v-btn>
          </v-col>
        </v-row>
        <v-data-table
          disable-sort
          class="pt-10 table-cursor"
          :loading="accountsLoading"
          :headers="accountHeaders"
          :items="accounts"
          disable-pagination
          hide-default-footer
          item-key="address"
          show-expand
          :single-expand="singleExpand"
          :expanded.sync="expanded"
          @click:row="expandRow"
        >
          <template v-slot:[`item.address`]="{ item }">
            <div class="font-weight-bold short-address">{{ item.address }}</div>
          </template>
          <template v-slot:[`item.stakeTime`]="{ item }">
            <span class="font-weight-bold">{{ item.stakeTime }}</span>
          </template>

          <template v-slot:[`item.action`]="{ item, index }">
            <div class="text-no-wrap">
              <v-btn
                color="primary"
                outlined
                @click.stop.prevent="removeAccount(item, index)"
              >
                <v-icon color="grey">mdi-delete</v-icon>
              </v-btn>
              <v-btn
                class="ml-1"
                color="primary"
                outlined
                @click.stop.prevent="refreshAccount(item, index)"
              >
                <v-icon color="grey">mdi-refresh</v-icon>
              </v-btn>
              <router-link :to="`/combat-history/${item.address}`">
                <v-btn class="ml-1" color="primary" outlined>
                  <v-icon color="grey">mdi-receipt</v-icon>
                </v-btn>
              </router-link>
            </div>
          </template>
          <template v-slot:[`expanded-item`]="{ item, headers }">
            <td :colspan="headers.length" style="width: 1000px" class="px-0">
              <v-data-table
                disable-sort
                class="table-cursor"
                :headers="characterHeaders"
                :items="item.characters"
                disable-pagination
                hide-default-footer
                dense
                @click:row="showDialog"
              >
                <template v-slot:[`item.actualLevel`]="{ item }">
                  <span>{{ item.actualLevel }} </span
                  ><span class="font-weight-bold"
                    >({{
                      getNextXP(item) > 0
                        ? getNextXP(item) + ' XP left'
                        : 'Claim Now'
                    }})</span
                  >
                </template>
                <template v-slot:[`item.traitName`]="{ item }">
                  <span :class="getElement(item.traitName)"></span>
                </template>
                <template v-slot:[`item.sta`]="{ item }">
                  <pre><span :class="getStaminaColor(item.sta)" style="font-weight: bold">{{ item.sta }}/200</span>
<span class="text-caption font-weight-bold">({{ getMaxStaminaTime(item.sta) }})</span></pre>
                </template>
              </v-data-table>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar" bottom>
      Invalid Address

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <div class="">
      <v-dialog v-model="dialog" width="600">
        <v-card>
          <v-card-title class="text-h7 font-weight-bold justify-center">
            Combat Simulator #{{ selectedChar.index + 1 }} |
            {{ selectedChar.id }} | {{ selectedChar.name }} |
            {{ selectedChar.level }} |
            <span :class="selectedChar.element"></span>
          </v-card-title>

          <v-card-text class="mx-auto">
            <div style="text-align: center" class="pa-2"></div>
            <div class="pa-2">
              <v-select
                v-model="selectedWeapon"
                :items="weapons"
                label="Select Weapon"
                item-value="id"
                @change="simulate"
              >
                <template slot="selection" slot-scope="data">
                  {{ data.item.stars + 1 }}
                  <v-icon color="yellow">mdi-star</v-icon
                  >{{ data.item.element }} - {{ data.item.id }}
                </template>
                <template slot="item" slot-scope="data">
                  {{ data.item.stars + 1 }}
                  <v-icon color="yellow">mdi-star</v-icon
                  >{{ data.item.element }} - {{ data.item.id }}
                </template>
              </v-select>

              <div style="text-align: center">
                <p class="text-h6 font-weight-black" style="color: black">
                  Enemies
                </p>
              </div>
              <v-data-table
                disable-sort
                :headers="chanceHeaders"
                :items="chances"
                disable-pagination
                hide-default-footer
                dense
                :loading="chancesLoading"
              >
                <template v-slot:[`item.traitName`]="{ item }">
                  <span :class="getElement(item.traitName)"></span>
                </template>
                <template v-slot:[`item.chance`]="{ item }">
                  <span
                    :class="getChanceColor(item.chance)"
                    style="font-weight: bold"
                    >{{ item.chance }}%</span
                  >
                </template>
              </v-data-table>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="simulate(selectedWeapon)"
              v-if="selectedWeapon != 0"
            >
              Refresh
            </v-btn>
            <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="loadingDialog" hide-overlay persistent width="300">
        <v-card color="green" dark>
          <v-card-text>
            Please stand by
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  inject,
  onBeforeUnmount,
} from '@vue/composition-api'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { useAccounts } from '../store/accounts'
import { getCharacterNameFromSeed } from '../store/character-name'
import { WeaponTrait, WeaponElement } from '../contracts/contracts'
import { xpTable } from '../constants/xp-table'
export default defineComponent({
  methods: {
    forceUpdate() {
      this.$forceUpdate()
    },
  },
  setup() {
    const folk: Contract = inject('folk') as Contract
    const folkwarriors: Contract = inject('folkwarriors') as Contract
    const character: Contract = inject('character') as Contract
    const weapon: Contract = inject('weapon') as Contract
    const maxTax = ref(0)
    const web3 = inject('web3') as Web3
    const folkwarriorsWS: Contract = inject('folkwarriorsWS') as Contract
    const staking: Contract = inject('staking') as Contract

    onBeforeUnmount(async () => {
      accounts.value.forEach(async (a) => {
        try {
          await a.subscription.unsubscribe()
          console.log('Unsubscribed', a.address)
        } catch (error) {
          console.log(error)
        }
      })
    })

    const accountHeaders = [
      { text: 'Address', value: 'address' },
      { text: 'Name', value: 'name' },
      { text: 'Wallet Folk', value: 'walletFolk' },
      { text: 'Wallet BNB', value: 'walletBNB' },
      { text: 'Unclaimed Folk', value: 'unclaimedFolk' },
      { text: 'Staked Folk', value: 'stakedFolk' },
      { text: 'Staking Time', value: 'stakeTime' },
      { text: 'Total Folk', value: 'totalFolk' },
      { text: 'Tax', value: 'tax' },
      { text: 'Action', value: 'action' },
    ]

    const characterHeaders = [
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
      { text: 'Element', value: 'traitName' },
      { text: 'Level', value: 'actualLevel' },
      { text: 'Stamina', value: 'sta' },
      { text: 'Current XP', value: 'xp' },
      { text: 'Unclaimed XP', value: 'exp' },
    ]

    const chanceHeaders = [
      { text: 'Element', value: 'traitName' },
      { text: 'Power', value: 'power' },
      { text: 'Chance', value: 'chance' },
      { text: 'Reward', value: 'reward' },
    ]
    const snackbar = ref(false)
    const accountsLoading = ref(false)
    const account = reactive({
      name: '',
      address: '',
    })
    const { accounts } = useAccounts()

    const storedAccounts: any[] =
      JSON.parse(localStorage.getItem('addresses')!) || []

    const fetchAccounts = async () => {
      accounts.value = []
      accountsLoading.value = true
      const accs = await Promise.all(
        storedAccounts.map(async (item) => {
          return await fetchAccount(item)
        })
      )
      accounts.value = accs
      accountsLoading.value = false
      //setTimeout(refreshAccounts, 30000)
    }

    const _refreshAccounts = async () => {
      accountsLoading.value = true
      const accs = await Promise.all(
        accounts.value.map(async (item) => {
          return await fetchAccount(item)
        })
      )
      accounts.value = accs
      accountsLoading.value = false
    }

    function refreshAccounts() {
      _refreshAccounts()
      setTimeout(refreshAccounts, 30000)
    }

    async function init() {
      maxTax.value = await folkwarriors.methods.REWARDS_CLAIM_TAX_MAX().call()
      fetchAccounts()
    }

    init()

    async function refreshAccount(item: any, index: number) {
      accountsLoading.value = true
      const account = await fetchAccount(item, index)
      accounts.value[index] = account
      accountsLoading.value = false
    }

    async function fetchAccount(item: any, index: number | null = null) {
      try {
        let walletFolk = Number(
          await folk.methods.balanceOf(item.address).call()
        )
        walletFolk = Number(
          parseFloat(
            web3.utils.fromWei(BigInt(walletFolk).toString(), 'ether')
          ).toFixed(4)
        )
        item.walletFolk = walletFolk

        let walletBNB = Number(await web3.eth.getBalance(item.address))
        walletBNB = Number(
          parseFloat(
            web3.utils.fromWei(BigInt(walletBNB).toString(), 'ether')
          ).toFixed(4)
        )
        item.walletBNB = walletBNB

        let unclaimedFolk = await folkwarriors.methods
          .getTokenRewards()
          .call({ from: item.address })

        unclaimedFolk = Number(
          parseFloat(
            web3.utils.fromWei(BigInt(unclaimedFolk).toString(), 'ether')
          ).toFixed(4)
        )

        item.unclaimedFolk = unclaimedFolk

        let stakedFolk = await staking.methods.balanceOf(item.address).call()

        const stakeTimeStamp = await staking.methods
          .getStakeUnlockTimeLeft()
          .call({ from: item.address })

        if (Number(stakedFolk) > 0) {
          if (Number(stakeTimeStamp) > 0) {
            const stakeTime = new Date(
              new Date().getTime() + stakeTimeStamp * 1000
            )

            item.stakeTime = stakeTime.toLocaleString(undefined, {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
          } else {
            item.stakeTime = 'Claim Now'
          }
        }

        stakedFolk = Number(
          parseFloat(
            web3.utils.fromWei(BigInt(stakedFolk).toString(), 'ether')
          ).toFixed(4)
        )
        item.stakedFolk = stakedFolk

        item.totalFolk = (
          Number(walletFolk) +
          Number(unclaimedFolk) +
          Number(stakedFolk)
        ).toFixed(4)

        const tax = await folkwarriors.methods
          .getOwnRewardsClaimTax()
          .call({ from: item.address })

        item.tax = ((tax * 0.15) / maxTax.value).toFixed(2)

        item.characters = await getCharacters(item.address)
        if (!item.subscription) {
          const subscription = fightListener(item.address)
          item.subscription = subscription
        }

        return item
      } catch (error) {
        console.log('Invalid Address', error)
      }
    }

    async function getCharacters(address: string) {
      const charIds: number[] = await folkwarriors.methods
        .getMyCharacters()
        .call({ from: address })
      const chars = await Promise.all(
        charIds.map(async (charId, index) => {
          const c = await character.methods.get(charId).call()
          const charData = characterFromContract(charId, c)
          const exp = await folkwarriors.methods.getXpRewards(charId).call()
          const sta = await character.methods.getStaminaPoints(charId).call()
          return {
            ...charData,
            exp: exp,
            sta: sta,
            ownerAddress: address,
            index: index,
            name: getCharacterNameFromSeed(charId),
            actualLevel: charData.level + 1,
            level: charData.level,
          }
        })
      )
      return chars
    }

    async function getWeapons(address: string) {
      const weapIds: any[] = await folkwarriors.methods
        .getMyWeapons()
        .call({ from: address })
      const weapons = await Promise.all(
        weapIds.map(async (weapId, index) => {
          const w = await weapon.methods.get(weapId).call()
          const weaponData: any = weaponFromContract(weapId, w)
          return { ...weaponData, ownerAddress: address, index: index }
        })
      )
      return weapons
    }

    function getStatPatternFromProperties(properties: any) {
      return (properties >> 5) & 0x7f
    }

    function getStat1Trait(statPattern: number) {
      return statPattern % 5
    }

    function getStat2Trait(statPattern: number) {
      return Math.floor(statPattern / 5) % 5
    }

    function getStat3Trait(statPattern: number) {
      return Math.floor(Math.floor(statPattern / 5) / 5) % 5
    }

    function statNumberToName(statNum: number) {
      switch (statNum) {
        case WeaponTrait.CHA:
          return 'CHA'
        case WeaponTrait.DEX:
          return 'DEX'
        case WeaponTrait.INT:
          return 'INT'
        case WeaponTrait.PWR:
          return 'PWR'
        case WeaponTrait.STR:
          return 'STR'
        default:
          return '???'
      }
    }

    function getWeaponTraitFromProperties(properties: any) {
      return (properties >> 3) & 0x3
    }

    function weaponFromContract(id: number, data: any) {
      const properties = data[0]
      const stat1 = data[1]
      const stat2 = data[2]
      const stat3 = data[3]
      const level = +data[4]
      const blade = data[5]
      const crossguard = data[6]
      const grip = data[7]
      const pommel = data[8]
      const burnPoints = +data[9]
      const bonusPower = +data[10]

      const stat1Value = +stat1
      const stat2Value = +stat2
      const stat3Value = +stat3

      const statPattern = getStatPatternFromProperties(+properties)
      const stat1Type = getStat1Trait(statPattern)
      const stat2Type = getStat2Trait(statPattern)
      const stat3Type = getStat3Trait(statPattern)

      const traitNum = getWeaponTraitFromProperties(+properties)

      const lowStarBurnPoints = burnPoints & 0xff
      const fourStarBurnPoints = (burnPoints >> 8) & 0xff
      const fiveStarBurnPoints = (burnPoints >> 16) & 0xff

      const stars = +properties & 0x7
      return {
        id: +id,
        properties,
        element: traitNumberToName(traitNum),
        stat1: statNumberToName(stat1Type),
        stat1Value,
        stat1Type,
        stat2: statNumberToName(stat2Type),
        stat2Value,
        stat2Type,
        stat3: statNumberToName(stat3Type),
        stat3Value,
        stat3Type,
        level,
        blade,
        crossguard,
        grip,
        pommel,
        stars,
        lowStarBurnPoints,
        fourStarBurnPoints,
        fiveStarBurnPoints,
        bonusPower,
      }
    }

    function characterFromContract(id: number, data: any) {
      const xp = data[0]
      const name = id
      const level = parseInt(data[1], 10)
      const trait = data[2]
      const traitName = traitNumberToName(+data[2])
      const staminaTimestamp = data[3]
      const head = data[4]
      const arms = data[5]
      const torso = data[6]
      const legs = data[7]
      const boots = data[8]
      const race = data[9]
      return {
        id: +id,
        name,
        xp,
        level,
        trait,
        traitName,
        staminaTimestamp,
        head,
        arms,
        torso,
        legs,
        boots,
        race,
      }
    }

    function traitNumberToName(traitNum: number) {
      switch (traitNum) {
        case 0:
          return 'Fire'
        case 1:
          return 'Earth'
        case 2:
          return 'Wind'
        case 3:
          return 'Water'
        default:
          return ''
      }
    }

    async function addAccount() {
      if (web3.utils.isAddress(account.address)) {
        const exists = accounts.value.some(
          (a) =>
            String(a['address']).toLowerCase() === account.address.toLowerCase()
        )
        if (!exists) {
          accountsLoading.value = true
          const acc = await fetchAccount({ ...account })
          accounts.value.push(acc)
          accountsLoading.value = false
          const sa = accounts.value.map((a) => {
            return { address: a.address, name: a.name }
          })
          localStorage.setItem('addresses', JSON.stringify(sa))
        }
        account.name = ''
        account.address = ''
      } else {
        snackbar.value = true
      }
    }

    async function removeAccount(item: any, index: number) {
      try {
        await item.subscription.unsubscribe()
        console.log('Unsubscribed', item.address)
      } catch (error) {
        console.log(error)
      }

      accounts.value.splice(index, 1)
      const sa = accounts.value.map((a) => {
        return { address: a.address, name: a.name }
      })
      localStorage.setItem('addresses', JSON.stringify(sa))
    }

    const singleExpand = ref(true)
    const expanded = ref([] as any)

    const getElement = (element: string) => {
      switch (element) {
        case 'Fire':
          return 'fire-icon'
        case 'Earth':
          return 'earth-icon'
        case 'Wind':
          return 'wind-icon'
        case 'Water':
          return 'water-icon'
        default:
          return ''
      }
    }

    const dialog = ref(false)
    const loadingDialog = ref(false)

    async function showDialog(row: any) {
      selectedWeapon.value = 0
      selectedChar.id = row.id
      selectedChar.name = row.name
      selectedChar.index = row.index
      selectedChar.level = row.actualLevel
      selectedChar.element = getElement(row.traitName)
      chances.value = []
      loadingDialog.value = true
      weapons.value = (await getWeapons(row.ownerAddress)) as any
      loadingDialog.value = false
      dialog.value = true
    }

    const weapons = ref([])
    const selectedWeapon = ref(0)

    async function simulate(weaponId: number) {
      try {
        chances.value = []
        chancesLoading.value = true
        const c = await character.methods.get(selectedChar.id).call()
        const charData = characterFromContract(selectedChar.id, c)
        const w = await weapon.methods.get(weaponId).call()
        const weaponData: any = weaponFromContract(weaponId, w)
        const targets = await folkwarriors.methods
          .getTargets(selectedChar.id, weaponId)
          .call()
        const enemies = getEnemyDetails(targets)
        const fightRewardGasOffset = await getFightRewardGasOffset()
        const fightRewardBaseline = await getFightRewardBaseline()
        chances.value = await Promise.all(
          enemies.map(async (enemy: any) => {
            const chance = getWinChance(charData, weaponData, enemy)
            const offset = web3.utils.toBN(
              Number(fightRewardGasOffset) +
                Number(fightRewardBaseline) *
                  Math.sqrt(Number(enemy.power) / 1000) *
                  1
            )
            const usdSickle = await folkwarriors.methods
              .usdToSkill(offset)
              .call()
            const sickle = Number(
              web3.utils.fromWei(BigInt(usdSickle).toString(), 'ether')
            )
            return {
              ...enemy,
              chance: `${(chance * 100).toFixed(2)}`,
              traitName: traitNumberToName(enemy.trait),
              reward: sickle,
            }
          })
        )
      } catch (error) {
        console.log(error)
      } finally {
        chancesLoading.value = false
      }
    }

    function getEnemyDetails(targets: any[]) {
      return targets.map((data) => {
        const n = parseInt(data, 10)
        return {
          original: data,
          power: n & 0b11111111_11111111_11111111,
          trait: n >> 24,
        }
      })
    }

    const selectedChar = reactive({} as any)
    function CharacterPower(level: number) {
      return (1000 + level * 10) * (Math.floor(level / 10) + 1)
    }
    function GetTotalMultiplierForTrait(wep: any, trait: number) {
      return (
        1 +
        0.01 *
          (Stat1PercentForChar(wep, trait) +
            Stat2PercentForChar(wep, trait) +
            Stat3PercentForChar(wep, trait))
      )
    }

    function Stat1PercentForChar(wep: any, trait: number) {
      return MultiplierPerEffectiveStat(
        AdjustStatForTrait(wep.stat1Value, wep.stat1Type, trait)
      )
    }

    function Stat2PercentForChar(wep: any, trait: number) {
      return MultiplierPerEffectiveStat(
        AdjustStatForTrait(wep.stat2Value, wep.stat2Type, trait)
      )
    }

    function Stat3PercentForChar(wep: any, trait: number) {
      return MultiplierPerEffectiveStat(
        AdjustStatForTrait(wep.stat3Value, wep.stat3Type, trait)
      )
    }

    function MultiplierPerEffectiveStat(statValue: number) {
      return statValue * 0.25
    }

    function AdjustStatForTrait(
      statValue: number,
      statTrait: number,
      charTrait: number
    ) {
      let value = statValue
      if (statTrait === charTrait) {
        value = Math.floor(value * 1.07)
      } else if (statTrait === WeaponTrait.PWR) {
        value = Math.floor(value * 1.03)
      }
      return value
    }

    function getElementAdvantage(playerElement: number, enemyElement: number) {
      if ((playerElement + 1) % 4 === enemyElement) return 1
      if ((enemyElement + 1) % 4 === playerElement) return -1
      return 0
    }

    function getWinChance(charData: any, weapData: any, enemy: any) {
      const characterPower = CharacterPower(charData.level)
      const playerElement = parseInt(charData.trait, 10)

      const we = WeaponElement[weapData.element as keyof typeof WeaponElement]
      const weaponElement = parseInt(we.toString(), 10)
      const weaponMultiplier = GetTotalMultiplierForTrait(
        weapData,
        playerElement
      )
      const totalPower = characterPower * weaponMultiplier + weapData.bonusPower
      const totalMultiplier =
        1 +
        0.075 * (weaponElement === playerElement ? 1 : 0) +
        0.075 * getElementAdvantage(playerElement, enemy.trait)
      const playerMin = totalPower * totalMultiplier * 0.9
      const playerMax = totalPower * totalMultiplier * 1.1
      const playerRange = playerMax - playerMin
      const enemyMin = enemy.power * 0.9
      const enemyMax = enemy.power * 1.1
      const enemyRange = enemyMax - enemyMin
      let rollingTotal = 0
      // shortcut: if it is impossible for one side to win, just say so
      //if (playerMin > enemyMax) return 3;
      if (playerMax < enemyMin) return 0

      // case 1: player power is higher than enemy power
      if (playerMin >= enemyMin) {
        // case 1: enemy roll is lower than player's minimum
        rollingTotal = (playerMin - enemyMin) / enemyRange
        // case 2: 1 is not true, and player roll is higher than enemy maximum
        rollingTotal +=
          (1 - rollingTotal) * ((playerMax - enemyMax) / playerRange)
        // case 3: 1 and 2 are not true, both values are in the overlap range. Since values are basically continuous, we assume 50%
        rollingTotal += (1 - rollingTotal) * 0.5
      } else {
        // case 1: player rolls below enemy minimum
        rollingTotal = (enemyMin - playerMin) / playerRange
        // case 2: enemy rolls above player maximum
        rollingTotal +=
          (1 - rollingTotal) * ((enemyMax - playerMax) / enemyRange)
        // case 3: 1 and 2 are not true, both values are in the overlap range
        rollingTotal += (1 - rollingTotal) * 0.5
        // since this is chance the enemy wins, we negate it
        rollingTotal = 1 - rollingTotal
      }
      return rollingTotal
    }

    function expandRow(value: any) {
      if (expanded.value.indexOf(value) >= 0) {
        expanded.value.splice(expanded.value.indexOf(value), 1)
      } else {
        expanded.value = []
        expanded.value.push(value)
      }
    }

    const chances = ref()
    const chancesLoading = ref(false)

    function fightListener(address: string) {
      const encodedAddress = web3.eth.abi.encodeParameter('address', address)

      const opts = {
        topics: [null, encodedAddress],
      }
      const subscription = folkwarriorsWS.events
        .FightOutcome(opts)
        .on('data', (event: any) => {
          const { owner } = event.returnValues
          console.log('event received', owner)
          const index = accounts.value.findIndex(
            (a) =>
              String(a.address).toLowerCase() === String(owner).toLowerCase()
          )
          refreshAccount(accounts.value[index], index)
        })
        .on('connected', (event: any) => console.log('Fight Listener', address))
        .on('error', (err: any) => console.log(err))
      return subscription
    }

    function getChanceColor(chance: number) {
      if (chance >= 85) return 'chance-green'
      else if (chance >= 70) return 'chance-yellow'
      else if (chance >= 50) return 'chance-orange'
      else return 'chance-red'
    }

    function getStaminaColor(sta: number) {
      if (sta >= 160) return 'chance-green'
      else if (sta >= 120) return 'chance-yellow'
      else if (sta >= 80) return 'chance-orange'
      else if (sta >= 40) return 'chance-red'
      else return ''
    }

    function getMaxStaminaTime(stamina: number) {
      return new Date(
        new Date().getTime() + (200 - stamina) * 5 * 60000
      ).toLocaleString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    }

    function getNextXP(character: any) {
      const nextLevel = Math.floor(character.level / 10 + 1) * 10
      let xp = 0
      for (let i = character.level; i < nextLevel; i++) {
        xp += xpTable[i]
      }

      const remainingXP =
        xp - (parseInt(character.xp) + parseInt(character.exp))
      return remainingXP
    }

    async function getFightRewardGasOffset() {
      return await folkwarriors.methods.fightRewardGasOffset().call()
    }

    async function getFightRewardBaseline() {
      return await folkwarriors.methods.fightRewardBaseline().call()
    }

    return {
      getNextXP,
      getStaminaColor,
      getChanceColor,
      account,
      addAccount,
      accountsLoading,
      accounts,
      accountHeaders,
      snackbar,
      removeAccount,
      refreshAccount,
      expanded,
      singleExpand,
      characterHeaders,
      getElement,
      dialog,
      showDialog,
      loadingDialog,
      weapons,
      selectedWeapon,
      simulate,
      selectedChar,
      chances,
      chanceHeaders,
      chancesLoading,
      expandRow,
      getMaxStaminaTime,
    }
  },
})
</script>

<style lang="scss" scoped>
.water-icon {
  color: #055050;
  content: url(../assets/water.png);
  width: 2em;
  height: 2em;
}
.fire-icon {
  color: #055050;
  content: url(../assets/fire.png);
  width: 2em;
  height: 2em;
}
.wind-icon {
  color: #055050;
  content: url(../assets/wind.png);
  width: 2em;
  height: 2em;
}
.earth-icon {
  color: #055050;
  content: url(../assets/earth.png);
  width: 2em;
  height: 2em;
}
</style>
<style lang="scss">
.table-cursor tbody tr:hover {
  cursor: pointer;
}
.chance-red {
  color: red;
}
.chance-green {
  color: green;
}
.chance-yellow {
  color: blue;
}
.chance-orange {
  color: rgb(170, 2, 2);
}
</style>

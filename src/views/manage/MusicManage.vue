<template>
  <PageLayout>
    <template #content>
      <BackgroundBlur v-if="is_blur" />

      <MusicForm v-if="is_OpenAdd" @close="toggleCloseAdd" :albums="albums" :genreData="genreData" />
      <ManageConfirmDialogue v-if="is_OpenDelete" :actionQuestion="`Do yoy want to delete ${itemName}?`"
        actionConfirm="Confirm Delete" @close="toggleCloseDelete" @confirm="confirmDelete" />
      <MusicForm v-if="is_OpenEdit" :musicId="editMusicId" :albums="albums" :genreData="genreData"
        @close="toggleCloseEdit" />
      <ManageConfirmDialogue v-if="is_OpenRestore" :actionQuestion="`Do you want to restore ${itemName}?`"
        actionConfirm="Confirm Restore" @close="toggleCloseRestore" @confirm="confirmRestore" />

      <div class="text-primary-text-color flex flex-col gap-2 w-full">
        <div class="flex h-screen">
          <div class="flex-1 mt-5">
            <div class="flex items-center justify-between mb-6">

              <div class="flex flex-col">
                <h1 class="text-lg font-bold">
                  All
                  <span v-if="is_tabShown == 'deleted'">Deleted</span>
                  <span v-if="is_tabShown == 'disabled'">Disabled</span>
                  <span v-if="is_tabShown == 'hidden'">Hidden</span>
                  Musics
                </h1>
                <div class="text-sm font-bold opacity-70">Total: {{ totalItems }}</div>
              </div>


              <div class="flex items-center space-x-4">

                <IconButton v-if="is_tabShown != 'deleted' && userData.is_artist" state="danger" name="fa-trash"
                  @action="toggleList('deleted', fetchDeletedMusic)" />
                <IconButton v-if="is_tabShown != 'disabled' && userData.is_staff" state="danger"
                  name="md-disabledvisible-sharp" @action="toggleList('disabled', fetchDisabledMusic)" />
                <IconButton v-if="is_tabShown != 'hidden' && userData.is_artist" state="success"
                  name="fa-regular-eye-slash" @action="toggleList('hidden', fetchHiddenMusic)" />
                <SmButton v-if="is_tabShown != 'all'" text=" All" @action="toggleList('all', fetchMusic)" />
                <SmSearchbar text="Search Music..." @action="searchMusic" />
                <IconButton v-if="userData.is_artist" @action="toggleOpenAdd" state="success" name="fa-plus" />

              </div>
            </div>

            <div class="flex flex-col justify-between">
              <div class="hidden sm:flex flex-row bg-transparent border-b border-b-primary-text-color">
                <div class="w-3/6 font-semibold">Name</div>
                <div class="flex w-full justify-around items-center font-semibold">
                  <div v-if="userData.is_artist & is_tabShown == 'all'">Hide</div>
                  <div v-if="userData.is_staff & is_tabShown == 'all'">Disable</div>
                  <div v-if="is_tabShown == 'deleted'">Restore</div>
                  <div v-if="is_tabShown == 'disabled'">Disable</div>
                  <div v-if="is_tabShown == 'hidden'">Hide</div>
                  <div v-if="userData.is_artist & is_tabShown == 'all'">Edit</div>
                  <div v-if="userData.is_artist & is_tabShown == 'all'">Delete</div>
                </div>
              </div>
              <div v-if="is_tabShown == 'all'">
                <div v-for="music in musics" :key="music.name"
                  class="flex sm:flex-row flex-col items-center border-b border-b-primary-text-color cursor-pointer hover:bg-light-primary-color py-2">
                  <ManageDetail :link="music.is_disabled" :id="music.id" :image="music.img_profile" :title="music.name"
                    :subtitle="music.artist_name" type="music" />

                  <div
                    class="flex w-full justify-around flex-row bg-transparent sm:hidden border-b border-b-primary-text-color">
                    <p v-if="userData.is_artist">Hide</p>
                    <p v-if="userData.is_staff">Disable</p>
                    <p v-if="userData.is_artist">Edit</p>
                    <p v-if="userData.is_artist">Delete</p>
                  </div>
                  <div class="flex w-full  justify-around items-center">
                    <EnableDisable v-if="userData.is_artist" mode="hide" :item="music"
                      @action="toggleHideMusic(music)" />
                    <EnableDisable v-if="userData.is_staff" mode="disable" :item="music"
                      @action="toggleDisableMusic(music)" />
                    <IconButton v-if="userData.is_artist" @click="toggleOpenEdit(music)" name="fa-regular-edit"
                      status="success" />
                    <IconButton v-if="userData.is_artist" @click="toggleOpenDelete(music)" name="fa-regular-trash-alt"
                      status="success" />
                  </div>
                </div>
                <PaginationCard v-if="totalItems" :totalItems="totalItems" :currentPage="currentPage"
                  @action="page => handlePageChange(page, fetchMusic)" />
                <div v-else
                  class="font-bold text-lg text-primary-text-color opacity-50 p-5 flex justify-center items-center">No
                  Album Found</div>
              </div>
              <div v-if="is_tabShown == 'hidden'">
                <div v-for="hiddenmusic in hiddenMusics" :key="hiddenmusic.name"
                  class="flex sm:flex-row flex-col items-center border-b border-b-primary-text-color cursor-pointer hover:bg-light-primary-color py-2">
                  <ManageDetail :link="hiddenmusic.is_disabled" :id="hiddenmusic.id" :image="hiddenmusic.img_profile"
                    :title="hiddenmusic.name" :subtitle="hiddenmusic.artist_name" type="music" />
                  <div class="flex w-full justify-around items-center">
                    <EnableDisable mode="hide" :item="hiddenmusic" @action="toggleHideMusic(hiddenmusic)" />
                  </div>
                </div>
                <PaginationCard v-if="totalItems" :totalItems="totalItems" :currentPage="currentPage"
                  @action="page => handlePageChange(page, fetchHiddenMusic)" />
                <div v-else
                  class="font-bold text-lg text-primary-text-color opacity-50 p-5 flex justify-center items-center">No
                  Album Found</div>
              </div>
              <div v-if="is_tabShown == 'disabled'">
                <div v-for="disabledmusic in disabledMusics" :key="disabledmusic.name"
                  class="flex sm:flex-row flex-col items-center border-b border-b-primary-text-color cursor-pointer hover:bg-light-primary-color py-2">

                  <ManageDetail :link="true" :id="disabledmusic.id" :image="disabledmusic.img_profile"
                    :title="disabledmusic.name" :subtitle="disabledmusic.artist_name" type="music" />
                  <div class="flex w-full justify-around items-center">
                    <EnableDisable mode="disable" :item="disabledmusic" @action="toggleDisableMusic(disabledmusic)" />
                  </div>
                </div>
                <PaginationCard v-if="totalItems" :totalItems="totalItems" :currentPage="currentPage"
                  @action="page => handlePageChange(page, fetchDisabledMusic)" />
                <div v-else
                  class="font-bold text-lg text-primary-text-color opacity-50 p-5 flex justify-center items-center">No
                  Album Found</div>
              </div>
              <div v-if="is_tabShown == 'deleted'">
                <div v-for="deletedmusic in deletedMusics" :key="deletedmusic.name"
                  class="flex sm:flex-row flex-col items-center border-b border-b-primary-text-color cursor-pointer hover:bg-light-primary-color py-2">
                  <ManageDetail :link="true" :id="deletedmusic.id" :image="deletedmusic.img_profile"
                    :title="deletedmusic.name" :subtitle="deletedmusic.artist_name" type="music" />
                  <div class="flex w-full justify-around items-center">
                    <IconButton @action="toggleOpenRestore(deletedmusic)" name="fa-trash-restore" state="success" />
                  </div>
                </div>
                <PaginationCard v-if="totalItems" :totalItems="totalItems" :currentPage="currentPage"
                  @action="page => handlePageChange(page, fetchDeletedMusic)" />
                <div v-else
                  class="font-bold text-lg text-primary-text-color opacity-50 p-5 flex justify-center items-center">No
                  Album Found</div>
              </div>
              <div class="mb-32"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import IconButton from '@/components/buttons/icon-button.vue'
import BackgroundBlur from '@/components/cards/BackgroundBlur.vue'
import MusicForm from '@/components/manage/MusicForm.vue'
import PaginationCard from '@/components/cards/PaginationCard.vue'
import SmSearchbar from '@/components/buttons/sm-searchbar.vue'
import SmButton from '@/components/buttons/sm-button.vue'
import ManageDetail from '@/components/manage/ManageDetail.vue'
import EnableDisable from '@/components/buttons/enabledisable.vue'
import ManageConfirmDialogue from '@/components/manage/ManageConfirmDialogue.vue'
import { useToast } from 'vue-toast-notification'
import store from '@/store/store'
const base_url = import.meta.env.VITE_BASE_API_URL;
const albums = ref([])
const genreData = ref([])
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
const $toast = useToast()
const access_token = localStorage.getItem('access_token')
const userData = computed(() => store.getters.getLoggedInUserData)
const musics = ref([])
const is_tabShown = ref("all")
const deletedMusics = ref([])
const disabledMusics = ref([])
const hiddenMusics = ref([])
const is_blur = ref(false)
const is_OpenAdd = ref(false)
const is_OpenEdit = ref(false)
const is_OpenDelete = ref(false)
const is_OpenRestore = ref(false)
const isLoading = ref(false)
const totalItems = ref([0])
const currentPage = ref([1])
let toDeleteValue = 0
let toRestoreValue = 0
const itemName = ref()



const handlePageChange = (page, func) => {
  currentPage.value = page
  func(page)
}


const toggleList = async (tabShown, func) => {
  is_tabShown.value = tabShown
  currentPage.value = 1
  func(currentPage.value)
}

const searchMusic = (text) => {
  if (is_tabShown.value == "all") fetchMusic(1, text)
  else if (is_tabShown.value == "disabled") fetchDisabledMusic(1, text)
  else if (is_tabShown.value == "deleted") fetchDeletedMusic(1, text)
  else if (is_tabShown.value == "hidden") fetchHiddenMusic(1, text)
}

const editMusicId = ref(null)
function toggleOpenAdd() {
  fetchAlbums()
  fetchGenre()
  is_OpenAdd.value = true
  is_blur.value = true
}
function toggleCloseAdd() {
  is_OpenAdd.value = false
  is_blur.value = false
  fetchMusic()
}
function toggleOpenEdit(music) {
  fetchAlbums()
  fetchGenre()
  is_OpenEdit.value = true
  is_blur.value = true
  editMusicId.value = music.id

}
function toggleCloseEdit() {
  is_OpenEdit.value = false
  is_blur.value = false
  fetchMusic()
}
function toggleOpenDelete(deletevalue) {
  is_OpenDelete.value = true
  is_blur.value = true
  toDeleteValue = deletevalue.id
  itemName.value = deletevalue.name
  fetchDeletedMusic()

}
function toggleCloseDelete() {
  is_OpenDelete.value = false
  is_blur.value = false
}

function toggleOpenRestore(restore) {
  is_OpenRestore.value = true
  is_blur.value = true
  toRestoreValue = restore.id
  itemName.value = restore.name
}
function toggleCloseRestore() {
  is_OpenRestore.value = false
  is_blur.value = false
}



const fetchMusic = async (page = 1, text = '') => {
  isLoading.value = true
  try {
    let data
    if (!userData.value.is_artist) {
      const response = await axios.get(`${base_url}/api/music/get/manage/?search=${text}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        params: {
          page: page,
          page_size: 10
        }
      })
      data = response.data.results
      totalItems.value = response.data.count
    } else {
      const response = await axios.get(`${base_url}/api/music/get/loggedin/manage/?search=${text}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        params: {
          page: page,
          page_size: 10
        }
      })
      data = response.data.results
      totalItems.value = response.data.count
    }
    musics.value = data
  } catch (error) {
    console.error('Error fetching musics:', error)
  } finally {
    isLoading.value = false
  }
}


const fetchDeletedMusic = async (page = 1, text = '') => {
  isLoading.value = true
  try {
    const response = await axios.get(`${base_url}/api/music/get/deleted/manage/?search=${text}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      params: {
        page: page,
        page_size: 10
      }
    })
    deletedMusics.value = response.data.results
    totalItems.value = response.data.count
  } catch (error) {
    console.error('Error fetching Music:', error)
  } finally {
    isLoading.value = false
  }
}



const fetchDisabledMusic = async (page = 1, text = '') => {
  isLoading.value = true
  try {
    const response = await axios.get(`${base_url}/api/music/get/disabled/manage/?search=${text}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      params: {
        page: page,
        page_size: 10
      }
    })
    disabledMusics.value = response.data.results
    totalItems.value = response.data.count
  } catch (error) {
    console.error('Error fetching Music:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchHiddenMusic = async (page = 1, text = '') => {
  isLoading.value = true
  try {
    const response = await axios.get(`${base_url}/api/music/get/hidden/manage/?search=${text}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      params: {
        page: page,
        page_size: 10
      }
    })
    hiddenMusics.value = response.data.results
    totalItems.value = response.data.count
  } catch (error) {
    console.error('Error fetching Music:', error)
  } finally {
    isLoading.value = false
  }
}


const fetchAlbums = async () => {
  try {
    let data
    if (!userData.value.is_artist) {
      const response = await axios.get(`${base_url}/api/album/get/`)
      data = response.data
    } else {
      const response = await axios.get(`${base_url}/api/album/get/loggedin/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      data = response.data
    }
    albums.value = data
  } catch (error) {
    console.error('Error fetching albums:', error)
  }
}

const fetchGenre = async () => {
  await axios
    .get(`${base_url}/api/genre/get/`)
    .then((response) => {
      genreData.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}




const toggleHideMusic = async (music) => {
  const originalIsHidden = !music.is_hidden
  const newIsHidden = !originalIsHidden
  const action = newIsHidden ? 'hide' : 'unhide'

  const requestUrl = `${base_url}/api/music/${action}/${music.id}/`

  try {
    await axios.delete(requestUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    $toast.success(`Music will be ${newIsHidden ? 'hidden' : 'visible'} to public`)
  } catch (error) {
    console.error(error)
    $toast.error(`Error occur while making music ${newIsHidden ? 'hidden' : 'visible'}`)
    music.is_hidden = originalIsHidden
  }
}
const toggleDisableMusic = async (music) => {
  const originalIsDisabled = !music.is_disabled
  const newIsDisabled = !originalIsDisabled
  const action = newIsDisabled ? 'disable' : 'enable'

  const requestUrl = `${base_url}/api/music/${action}/${music.id}/`

  try {
    await axios.delete(requestUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    $toast.success(`Music is made ${newIsDisabled ? 'disable' : 'enable'}`)
  } catch (error) {
    console.error(error)
    $toast.error(`Error occur while making music ${newIsDisabled ? 'disable' : 'enable'}`)
    music.is_disabled = originalIsDisabled
  }
}
function confirmDelete() {
  axios({
    method: 'delete',
    url: `${base_url}/api/music/delete/${toDeleteValue}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      musics.value = musics.value.filter((music) => music.id !== toDeleteValue)
      $toast.success('Music is deleted', {
        position: 'top-right'
      })
      if (response.status === 200) {
        is_OpenDelete.value = false
        is_blur.value = false
      }
    })
    .catch((err) => {
      console.log(err.response.data)
    })
}


function confirmRestore() {
  axios({
    method: 'delete',
    url: `${base_url}/api/music/recover/${toRestoreValue}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      deletedMusics.value = deletedMusics.value.filter((deletedMusics) => deletedMusics.id !== toRestoreValue)
      $toast.success('Music is Restored', {
        position: 'top-right'
      })
      if (response.status === 200) {
        is_OpenRestore.value = false
        is_blur.value = false
      }
    })
    .catch((err) => {
      console.log(err.response.data)
    })
}

onMounted(() => {
  fetchMusic()
})
</script>

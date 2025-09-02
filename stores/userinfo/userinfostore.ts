import type {
  AdminProfile,
  AdminProfileResponse,
} from "~/types/userinfo/userinfo";

export const useAdminProfileStore = defineStore("adminProfile", {
  state: () => ({
    adminProfile: null as AdminProfile | null,
    loading: false,
    updateLoading: false,
    error: null as string | null,
    permissions: [] as string[],
  }),

  getters: {
    profileImageUrl: (state) => {
      if (!state.adminProfile?.profile_image) return undefined;
      const timestamp = Date.now();
      const baseUrl = state.adminProfile.profile_image;
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}v=${timestamp}`;
    },
  },

  actions: {
    hasPermission(permission: string): boolean {      
      return this.permissions.includes(permission);
    },

    loadPermissions() {
      try {
        this.permissions = JSON.parse(
          localStorage.getItem("permissions") || "[]"
          
        );
      } catch {
        this.permissions = [];
      }
    },

    async fetchAdminProfile() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await useFetchDataApi<AdminProfileResponse>(
          "/profile"
        );

        if (data.value?.status === 200 && data.value.data) {
          this.adminProfile = data.value.data;
        } else {
          this.error = data.value?.message || "Failed to fetch profile";
          message.error(this.error);
        }
      } catch (err: any) {
        console.error("❌ Fetch Error:", err);
        this.error = "Failed to fetch admin profile";
        message.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(name: string, email: string) {
      this.updateLoading = true;
      try {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", name);
        formData.append("email", email);

        const { data } = await useFetchDataApi<AdminProfileResponse>(
          "/profile",
          {
            method: "POST",
            body: formData,
          }
        );

        if (data.value?.data) {
          this.adminProfile = data.value.data;
          message.success("Profile updated successfully!");
        } else {
          message.error(data.value?.message || "Failed to update profile");
        }
      } catch (err: any) {
        console.error("❌ Update Error:", err);
        message.error("Failed to update profile");
      } finally {
        this.updateLoading = false;
      }
    },

    async updateProfileImage(file: File) {
      if (!file.type.startsWith("image/")) {
        message.error("Please select an image file!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error("Image size must be less than 5MB!");
        return;
      }

      this.updateLoading = true;
      try {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("profile_image", file);

        const { data } = await useFetchDataApi<AdminProfileResponse>(
          "/profile",
          {
            method: "POST",
            body: formData,
          }
        );

        if (data.value?.data) {
          this.adminProfile = data.value.data;
          message.success("Profile image updated successfully!");
        } else {
          message.error(
            data.value?.message || "Failed to update profile image"
          );
        }
      } catch (err: any) {
        console.error("❌ Image Upload Error:", err);
        message.error("Failed to update profile image");
      } finally {
        this.updateLoading = false;
      }
    },
  },
});

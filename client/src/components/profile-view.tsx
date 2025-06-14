import { useState } from "react";
import { mockData } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileView() {
  const [profile, setProfile] = useState(mockData.profile);

  const handleSave = () => {
    // Save profile changes
    console.log("Saving profile:", profile);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">{profile.initials}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{profile.name}</h3>
              <p className="text-slate-600 mb-4">Photographer & Designer</p>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300">
                Edit Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-6">Profile Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <Input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <Textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

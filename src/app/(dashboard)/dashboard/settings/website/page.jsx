'use client';

import { useState } from 'react';
import { FiSave, FiGlobe, FiMail, FiPhone, FiMapPin, FiImage, FiSearch, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiLinkedin, FiSettings } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Sample initial settings data
const initialSettings = {
  general: {
    siteName: 'Dava Dukaan',
    tagline: 'Fresh vegetables delivered to your doorstep',
    email: 'contact@davadukaan.com',
    phone: '+91 9876543210',
    address: '123 Market Street, Bangalore, Karnataka, India',
    logo: 'https://via.placeholder.com/200x60?text=Dava+Dukaan',
    favicon: 'https://via.placeholder.com/32x32',
    currency: 'INR',
    currencySymbol: '₹',
    language: 'en',
    timezone: 'Asia/Kolkata'
  },
  seo: {
    metaTitle: 'Dava Dukaan - Fresh Vegetables Delivered',
    metaDescription: 'Order fresh, locally-sourced vegetables online and get them delivered to your doorstep. Dava Dukaan offers the freshest produce in town.',
    keywords: 'vegetables, fresh produce, organic, delivery, local farm',
    googleAnalyticsId: 'UA-XXXXXXXXX-X',
    facebookPixelId: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true
  },
  social: {
    facebook: 'https://facebook.com/davadukaan',
    instagram: 'https://instagram.com/davadukaan',
    twitter: 'https://twitter.com/davadukaan',
    youtube: '',
    linkedin: '',
    whatsapp: '+919876543210'
  },
  appearance: {
    primaryColor: '#22C55E', // Green-600
    secondaryColor: '#0F766E', // Teal-700
    fontFamily: 'Inter, sans-serif',
    enableDarkMode: false,
    showFeaturedProducts: true,
    productsPerPage: 12,
    enableRecentlyViewed: true
  },
  business: {
    businessName: 'Dava Dukaan Pvt Ltd',
    gstNumber: '29AABCU9603R1ZX',
    panNumber: 'AABCU9603R',
    businessType: 'Retail',
    yearEstablished: '2022'
  }
};

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(settings.general.logo);
  const [faviconPreview, setFaviconPreview] = useState(settings.general.favicon);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        handleChange('general', 'logo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target.result);
        handleChange('general', 'favicon', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send the settings to your API
      // const response = await fetch('/api/settings/website', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      // if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Website settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Website Settings</h1>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'general' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'seo' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'social' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('social')}
          >
            Social Media
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'appearance' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'business' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('business')}
          >
            Business Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    value={settings.general.tagline}
                    onChange={(e) => handleChange('general', 'tagline', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={settings.general.email}
                      onChange={(e) => handleChange('general', 'email', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="text"
                      value={settings.general.phone}
                      onChange={(e) => handleChange('general', 'phone', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    rows="2"
                    value={settings.general.address}
                    onChange={(e) => handleChange('general', 'address', e.target.value)}
                    className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0 h-16 w-48 bg-gray-100 rounded-md overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <FiImage className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label htmlFor="logo-upload" className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                      Change
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleLogoChange}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Recommended size: 200x60 pixels</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Favicon preview" className="h-full w-full object-contain" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <FiImage className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label htmlFor="favicon-upload" className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                      Change
                      <input
                        id="favicon-upload"
                        name="favicon-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFaviconChange}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Recommended size: 32x32 pixels</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={settings.general.currency}
                    onChange={(e) => handleChange('general', 'currency', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="INR">Indian Rupee (INR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    id="currencySymbol"
                    type="text"
                    value={settings.general.currencySymbol}
                    onChange={(e) => handleChange('general', 'currencySymbol', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    id="language"
                    value={settings.general.language}
                    onChange={(e) => handleChange('general', 'language', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="kn">Kannada</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  id="metaTitle"
                  type="text"
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleChange('seo', 'metaTitle', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {settings.seo.metaTitle.length}/60 characters recommended
                </p>
              </div>
              
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows="3"
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleChange('seo', 'metaDescription', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {settings.seo.metaDescription.length}/160 characters recommended
                </p>
              </div>
              
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <textarea
                  id="keywords"
                  rows="2"
                  value={settings.seo.keywords}
                  onChange={(e) => handleChange('seo', 'keywords', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Comma-separated keywords"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Analytics ID
                  </label>
                  <input
                    id="googleAnalyticsId"
                    type="text"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => handleChange('seo', 'googleAnalyticsId', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label htmlFor="facebookPixelId" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Pixel ID
                  </label>
                  <input
                    id="facebookPixelId"
                    type="text"
                    value={settings.seo.facebookPixelId}
                    onChange={(e) => handleChange('seo', 'facebookPixelId', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="XXXXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="robotsTxt" className="block text-sm font-medium text-gray-700 mb-1">
                  robots.txt Content
                </label>
                <textarea
                  id="robotsTxt"
                  rows="4"
                  value={settings.seo.robotsTxt}
                  onChange={(e) => handleChange('seo', 'robotsTxt', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="sitemapEnabled"
                  type="checkbox"
                  checked={settings.seo.sitemapEnabled}
                  onChange={(e) => handleChange('seo', 'sitemapEnabled', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="sitemapEnabled" className="ml-2 block text-sm text-gray-700">
                  Enable XML Sitemap
                </label>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Page URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFacebook className="text-gray-400" />
                    </div>
                    <input
                      id="facebook"
                      type="url"
                      value={settings.social.facebook}
                      onChange={(e) => handleChange('social', 'facebook', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram Profile URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiInstagram className="text-gray-400" />
                    </div>
                    <input
                      id="instagram"
                      type="url"
                      value={settings.social.instagram}
                      onChange={(e) => handleChange('social', 'instagram', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter Profile URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTwitter className="text-gray-400" />
                    </div>
                    <input
                      id="twitter"
                      type="url"
                      value={settings.social.twitter}
                      onChange={(e) => handleChange('social', 'twitter', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube Channel URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiYoutube className="text-gray-400" />
                    </div>
                    <input
                      id="youtube"
                      type="url"
                      value={settings.social.youtube}
                      onChange={(e) => handleChange('social', 'youtube', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Page URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLinkedin className="text-gray-400" />
                    </div>
                    <input
                      id="linkedin"
                      type="url"
                      value={settings.social.linkedin}
                      onChange={(e) => handleChange('social', 'linkedin', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Business Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      id="whatsapp"
                      type="text"
                      value={settings.social.whatsapp}
                      onChange={(e) => handleChange('social', 'whatsapp', e.target.value)}
                      className="w-full border rounded-lg pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+919876543210"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Include country code with + symbol
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800">Social Media Tips</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>Use complete URLs including https://</li>
                  <li>Keep your social media profiles consistent with your brand</li>
                  <li>Regularly update your social media content</li>
                  <li>Link to your website from all social profiles</li>
                </ul>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center">
                    <input
                      id="primaryColor"
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                      className="w-10 h-10 border-0 p-0 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{settings.appearance.primaryColor}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Main brand color used throughout the site</p>
                </div>
                
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center">
                    <input
                      id="secondaryColor"
                      type="color"
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                      className="w-10 h-10 border-0 p-0 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{settings.appearance.secondaryColor}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Accent color used for buttons and highlights</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    id="fontFamily"
                    value={settings.appearance.fontFamily}
                    onChange={(e) => handleChange('appearance', 'fontFamily', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="productsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
                    Products Per Page
                  </label>
                  <select
                    id="productsPerPage"
                    value={settings.appearance.productsPerPage}
                    onChange={(e) => handleChange('appearance', 'productsPerPage', parseInt(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="16">16</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="enableDarkMode"
                    type="checkbox"
                    checked={settings.appearance.enableDarkMode}
                    onChange={(e) => handleChange('appearance', 'enableDarkMode', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableDarkMode" className="ml-2 block text-sm text-gray-700">
                    Enable Dark Mode Option
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="showFeaturedProducts"
                    type="checkbox"
                    checked={settings.appearance.showFeaturedProducts}
                    onChange={(e) => handleChange('appearance', 'showFeaturedProducts', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showFeaturedProducts" className="ml-2 block text-sm text-gray-700">
                    Show Featured Products on Homepage
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="enableRecentlyViewed"
                    type="checkbox"
                    checked={settings.appearance.enableRecentlyViewed}
                    onChange={(e) => handleChange('appearance', 'enableRecentlyViewed', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableRecentlyViewed" className="ml-2 block text-sm text-gray-700">
                    Enable Recently Viewed Products
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-800">Preview</h3>
                <div className="mt-3 p-4 border rounded-lg bg-white">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-16 h-8 rounded" 
                      style={{ backgroundColor: settings.appearance.primaryColor }}
                    ></div>
                    <div 
                      className="w-16 h-8 rounded" 
                      style={{ backgroundColor: settings.appearance.secondaryColor }}
                    ></div>
                  </div>
                  <div 
                    className="mt-3 p-2 text-sm rounded" 
                    style={{ fontFamily: settings.appearance.fontFamily }}
                  >
                    This is how your text will appear with the selected font family.
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: settings.appearance.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: settings.appearance.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Info Settings */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={settings.business.businessName}
                    onChange={(e) => handleChange('business', 'businessName', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    value={settings.business.businessType}
                    onChange={(e) => handleChange('business', 'businessType', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Both">Both Retail & Wholesale</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    id="gstNumber"
                    type="text"
                    value={settings.business.gstNumber}
                    onChange={(e) => handleChange('business', 'gstNumber', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="29AABCU9603R1ZX"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    15-digit GST Identification Number
                  </p>
                </div>
                
                <div>
                  <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Number
                  </label>
                  <input
                    id="panNumber"
                    type="text"
                    value={settings.business.panNumber}
                    onChange={(e) => handleChange('business', 'panNumber', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="AABCU9603R"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    10-character Permanent Account Number
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700 mb-1">
                    Year Established
                  </label>
                  <input
                    id="yearEstablished"
                    type="text"
                    value={settings.business.yearEstablished}
                    onChange={(e) => handleChange('business', 'yearEstablished', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="2022"
                  />
                </div>
                
                <div>
                  <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Hours
                  </label>
                  <input
                    id="businessHours"
                    type="text"
                    value={settings.business.businessHours || "Mon-Sat: 9:00 AM - 6:00 PM"}
                    onChange={(e) => handleChange('business', 'businessHours', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Mon-Sat: 9:00 AM - 6:00 PM"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Disclaimer
                </label>
                <textarea
                  id="legalDisclaimer"
                  rows="3"
                  value={settings.business.legalDisclaimer || "© 2023 Dava Dukaan Pvt Ltd. All rights reserved. All product images and descriptions are for illustrative purposes only."}
                  onChange={(e) => handleChange('business', 'legalDisclaimer', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your legal disclaimer text here"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will appear in the footer of your website
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Business Information</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Your business information is used for invoicing, tax calculations, and legal compliance. 
                  Make sure all details are accurate and up-to-date.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
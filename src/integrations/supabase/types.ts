export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_bills: {
        Row: {
          amount_due: number
          amount_paid: number
          bill_date: string
          bill_number: string
          bill_type: string
          created_at: string
          created_by: string
          customer_address: string | null
          customer_name: string
          customer_phone: string | null
          discount: number
          grand_total: number
          id: string
          items: Json
          notes: string | null
          payment_status: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          bill_date?: string
          bill_number: string
          bill_type?: string
          created_at?: string
          created_by: string
          customer_address?: string | null
          customer_name: string
          customer_phone?: string | null
          discount?: number
          grand_total?: number
          id?: string
          items?: Json
          notes?: string | null
          payment_status?: string
          subtotal?: number
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          bill_date?: string
          bill_number?: string
          bill_type?: string
          created_at?: string
          created_by?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          grand_total?: number
          id?: string
          items?: Json
          notes?: string | null
          payment_status?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: []
      }
      before_after_showcase: {
        Row: {
          after_image_url: string
          before_image_url: string
          caption: string | null
          created_at: string
          customer_name: string
          display_order: number
          id: string
          is_active: boolean
          product_name: string
          updated_at: string
        }
        Insert: {
          after_image_url: string
          before_image_url: string
          caption?: string | null
          created_at?: string
          customer_name?: string
          display_order?: number
          id?: string
          is_active?: boolean
          product_name: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string
          before_image_url?: string
          caption?: string | null
          created_at?: string
          customer_name?: string
          display_order?: number
          id?: string
          is_active?: boolean
          product_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_item_uploads: {
        Row: {
          cart_item_id: string
          created_at: string
          field_id: string
          file_url: string
          id: string
          label: string
          product_id: string
          required: boolean
          user_id: string
        }
        Insert: {
          cart_item_id: string
          created_at?: string
          field_id: string
          file_url: string
          id?: string
          label: string
          product_id: string
          required?: boolean
          user_id: string
        }
        Update: {
          cart_item_id?: string
          created_at?: string
          field_id?: string
          file_url?: string
          id?: string
          label?: string
          product_id?: string
          required?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_item_uploads_cart_item_id_fkey"
            columns: ["cart_item_id"]
            isOneToOne: false
            referencedRelation: "cart_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          id: string
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_amount: number | null
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      custom_ads: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          slot_height: number
          slot_id: string
          slot_width: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          slot_height?: number
          slot_id: string
          slot_width?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          slot_height?: number
          slot_id?: string
          slot_width?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_gallery: {
        Row: {
          caption: string | null
          created_at: string
          customer_name: string
          id: string
          image_url: string
          is_approved: boolean
          product_id: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url: string
          is_approved?: boolean
          product_id?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string
          is_approved?: boolean
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_gallery_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_settings: {
        Row: {
          auto_enable_by_date: boolean
          banner_image_url: string | null
          created_at: string
          end_date: string | null
          greeting_text: string | null
          id: string
          is_enabled: boolean
          primary_color_override: string | null
          show_countdown: boolean
          start_date: string | null
          theme_name: string
          updated_at: string
        }
        Insert: {
          auto_enable_by_date?: boolean
          banner_image_url?: string | null
          created_at?: string
          end_date?: string | null
          greeting_text?: string | null
          id?: string
          is_enabled?: boolean
          primary_color_override?: string | null
          show_countdown?: boolean
          start_date?: string | null
          theme_name?: string
          updated_at?: string
        }
        Update: {
          auto_enable_by_date?: boolean
          banner_image_url?: string | null
          created_at?: string
          end_date?: string | null
          greeting_text?: string | null
          id?: string
          is_enabled?: boolean
          primary_color_override?: string | null
          show_countdown?: boolean
          start_date?: string | null
          theme_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon_emoji: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_orders: {
        Row: {
          admin_notes: string | null
          amount: number
          category_id: string | null
          created_at: string
          customer_name: string
          delivered_at: string | null
          delivery_status: string
          email: string | null
          expected_delivery_at: string
          form_data: Json
          id: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          updated_at: string
          user_id: string | null
          video_id: string | null
          video_title: string | null
          whatsapp_number: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          customer_name: string
          delivered_at?: string | null
          delivery_status?: string
          email?: string | null
          expected_delivery_at?: string
          form_data?: Json
          id?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          updated_at?: string
          user_id?: string | null
          video_id?: string | null
          video_title?: string | null
          whatsapp_number: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          customer_name?: string
          delivered_at?: string | null
          delivery_status?: string
          email?: string | null
          expected_delivery_at?: string
          form_data?: Json
          id?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          updated_at?: string
          user_id?: string | null
          video_id?: string | null
          video_title?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_orders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "invite_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_orders_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "invite_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_videos: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          price: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          price?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          price?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "invite_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_balances: {
        Row: {
          current_balance: number
          tier: string
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_balance?: number
          tier?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_balance?: number
          tier?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          source: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          source: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          created_at: string
          enabled: boolean
          gold_threshold: number
          id: string
          min_redeem_points: number
          platinum_threshold: number
          points_per_rupee: number
          points_value_rupees: number
          review_bonus: number
          signup_bonus: number
          silver_threshold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          gold_threshold?: number
          id?: string
          min_redeem_points?: number
          platinum_threshold?: number
          points_per_rupee?: number
          points_value_rupees?: number
          review_bonus?: number
          signup_bonus?: number
          silver_threshold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          gold_threshold?: number
          id?: string
          min_redeem_points?: number
          platinum_threshold?: number
          points_per_rupee?: number
          points_value_rupees?: number
          review_bonus?: number
          signup_bonus?: number
          silver_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_item_uploads: {
        Row: {
          created_at: string
          field_id: string
          file_url: string
          id: string
          label: string
          order_item_id: string
          required: boolean
        }
        Insert: {
          created_at?: string
          field_id: string
          file_url: string
          id?: string
          label: string
          order_item_id: string
          required?: boolean
        }
        Update: {
          created_at?: string
          field_id?: string
          file_url?: string
          id?: string
          label?: string
          order_item_id?: string
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "order_item_uploads_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          admin_preview_url: string | null
          back_design_url: string | null
          created_at: string
          design_approval_status: string | null
          front_design_url: string | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
        }
        Insert: {
          admin_preview_url?: string | null
          back_design_url?: string | null
          created_at?: string
          design_approval_status?: string | null
          front_design_url?: string | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
        }
        Update: {
          admin_preview_url?: string | null
          back_design_url?: string | null
          created_at?: string
          design_approval_status?: string | null
          front_design_url?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          customer_name: string | null
          delivery_charge: number | null
          delivery_days_used: number | null
          delivery_method: string | null
          email: string | null
          estimated_delivery_date: string | null
          id: string
          landmark: string | null
          order_notes: string | null
          payment_id: string | null
          payment_status: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          shipping_address: string
          shipping_city: string
          shipping_phone: string
          shipping_pincode: string
          shipping_state: string
          shiprocket_awb: string | null
          shiprocket_courier_name: string | null
          shiprocket_order_id: string | null
          shiprocket_shipment_id: string | null
          status: string
          status_emails_sent: string[] | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          customer_name?: string | null
          delivery_charge?: number | null
          delivery_days_used?: number | null
          delivery_method?: string | null
          email?: string | null
          estimated_delivery_date?: string | null
          id?: string
          landmark?: string | null
          order_notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipping_address: string
          shipping_city: string
          shipping_phone: string
          shipping_pincode: string
          shipping_state: string
          shiprocket_awb?: string | null
          shiprocket_courier_name?: string | null
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          status?: string
          status_emails_sent?: string[] | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          customer_name?: string | null
          delivery_charge?: number | null
          delivery_days_used?: number | null
          delivery_method?: string | null
          email?: string | null
          estimated_delivery_date?: string | null
          id?: string
          landmark?: string | null
          order_notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_phone?: string
          shipping_pincode?: string
          shipping_state?: string
          shiprocket_awb?: string | null
          shiprocket_courier_name?: string | null
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          status?: string
          status_emails_sent?: string[] | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          back_upload_enabled: boolean | null
          breadth_cm: number | null
          category_id: string | null
          created_at: string
          customization_enabled: boolean | null
          cutoff_time: string | null
          delivery_charge: number | null
          delivery_days: number | null
          description: string | null
          display_order: number
          enable_delivery: boolean | null
          front_upload_required: boolean | null
          height_cm: number | null
          id: string
          image_url: string | null
          image_urls: Json | null
          is_active: boolean | null
          length_cm: number | null
          name: string
          price: number
          sale_end: string | null
          sale_price: number | null
          sale_start: string | null
          stock_quantity: number | null
          updated_at: string
          upload_config: Json | null
          weight_kg: number | null
        }
        Insert: {
          back_upload_enabled?: boolean | null
          breadth_cm?: number | null
          category_id?: string | null
          created_at?: string
          customization_enabled?: boolean | null
          cutoff_time?: string | null
          delivery_charge?: number | null
          delivery_days?: number | null
          description?: string | null
          display_order?: number
          enable_delivery?: boolean | null
          front_upload_required?: boolean | null
          height_cm?: number | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          is_active?: boolean | null
          length_cm?: number | null
          name: string
          price: number
          sale_end?: string | null
          sale_price?: number | null
          sale_start?: string | null
          stock_quantity?: number | null
          updated_at?: string
          upload_config?: Json | null
          weight_kg?: number | null
        }
        Update: {
          back_upload_enabled?: boolean | null
          breadth_cm?: number | null
          category_id?: string | null
          created_at?: string
          customization_enabled?: boolean | null
          cutoff_time?: string | null
          delivery_charge?: number | null
          delivery_days?: number | null
          description?: string | null
          display_order?: number
          enable_delivery?: boolean | null
          front_upload_required?: boolean | null
          height_cm?: number | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          is_active?: boolean | null
          length_cm?: number | null
          name?: string
          price?: number
          sale_end?: string | null
          sale_price?: number | null
          sale_start?: string | null
          stock_quantity?: number | null
          updated_at?: string
          upload_config?: Json | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone: string | null
          pincode: string | null
          referred_by: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          pincode?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          pincode?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          total_earnings: number
          total_referrals: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          total_earnings?: number
          total_referrals?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          total_earnings?: number
          total_referrals?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          referee_id: string
          referee_reward: number
          referrer_id: string
          referrer_reward: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          referee_id: string
          referee_reward?: number
          referrer_id: string
          referrer_reward?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          referee_id?: string
          referee_reward?: number
          referrer_id?: string
          referrer_reward?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_loved: boolean | null
          admin_reply: string | null
          admin_reply_at: string | null
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          review_images: Json | null
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          admin_loved?: boolean | null
          admin_reply?: string | null
          admin_reply_at?: string | null
          comment: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          review_images?: Json | null
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          admin_loved?: boolean | null
          admin_reply?: string | null
          admin_reply_at?: string | null
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review_images?: Json | null
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_pickup_earnings: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          customer_name: string
          customer_phone: string | null
          id: string
          items_description: string
          notes: string | null
          payment_method: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          items_description: string
          notes?: string | null
          payment_method?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items_description?: string
          notes?: string | null
          payment_method?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          announcement_enabled: boolean | null
          announcement_text: string | null
          bulk_discount_enabled: boolean | null
          bulk_discount_min_qty: number | null
          bulk_discount_percent: number | null
          created_at: string
          default_delivery_charge: number | null
          delivery_disclaimer_enabled: boolean | null
          delivery_time_text: string | null
          id: string
          pickup_address: string | null
          pickup_pincode: string | null
          return_policy_enabled: boolean | null
          return_window_hours: number | null
          shiprocket_enabled: boolean | null
          shiprocket_fallback_message: string | null
          social_proof_enabled: boolean | null
          store_pickup_enabled: boolean | null
          updated_at: string
          whatsapp_support_number: string | null
        }
        Insert: {
          announcement_enabled?: boolean | null
          announcement_text?: string | null
          bulk_discount_enabled?: boolean | null
          bulk_discount_min_qty?: number | null
          bulk_discount_percent?: number | null
          created_at?: string
          default_delivery_charge?: number | null
          delivery_disclaimer_enabled?: boolean | null
          delivery_time_text?: string | null
          id?: string
          pickup_address?: string | null
          pickup_pincode?: string | null
          return_policy_enabled?: boolean | null
          return_window_hours?: number | null
          shiprocket_enabled?: boolean | null
          shiprocket_fallback_message?: string | null
          social_proof_enabled?: boolean | null
          store_pickup_enabled?: boolean | null
          updated_at?: string
          whatsapp_support_number?: string | null
        }
        Update: {
          announcement_enabled?: boolean | null
          announcement_text?: string | null
          bulk_discount_enabled?: boolean | null
          bulk_discount_min_qty?: number | null
          bulk_discount_percent?: number | null
          created_at?: string
          default_delivery_charge?: number | null
          delivery_disclaimer_enabled?: boolean | null
          delivery_time_text?: string | null
          id?: string
          pickup_address?: string | null
          pickup_pincode?: string | null
          return_policy_enabled?: boolean | null
          return_window_hours?: number | null
          shiprocket_enabled?: boolean | null
          shiprocket_fallback_message?: string | null
          social_proof_enabled?: boolean | null
          store_pickup_enabled?: boolean | null
          updated_at?: string
          whatsapp_support_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      trending_products: {
        Row: {
          order_count: number | null
          product_id: string | null
          total_sold: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_loyalty_points: {
        Args: {
          p_description?: string
          p_points: number
          p_reference_id?: string
          p_source: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_delete_user: { Args: { p_user_id: string }; Returns: undefined }
      get_abandoned_cart_customers: {
        Args: never
        Returns: {
          cart_items_count: number
          email: string
          full_name: string
          last_upload_at: string
          latest_product_id: string
          latest_product_name: string
          phone: string
          uploaded_products: string
          user_id: string
        }[]
      }
      get_all_customers: {
        Args: never
        Returns: {
          email: string
          full_name: string
          phone: string
          user_id: string
        }[]
      }
      get_public_stats: {
        Args: never
        Returns: {
          total_customers: number
          total_orders: number
          total_products: number
          total_reviews: number
        }[]
      }
      get_referrer_by_code: { Args: { p_code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { coupon_id_input: string }
        Returns: undefined
      }
      validate_referral_code: { Args: { p_code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

/**
 * Database types for server-only Supabase access.
 * Hand-written to match supabase/migrations.
 * When Docker/local Supabase is available, replace with:
 * `npm run db:types`
 * Do not import this module from Client Components.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      app_roles: {
        Row: {
          id: number;
          code: string;
          name: string;
        };
        Insert: {
          id: number;
          code: string;
          name: string;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_path: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_path?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_path?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      checkout_attempts: {
        Row: {
          user_id: string;
          idempotency_key: string;
          order_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          idempotency_key: string;
          order_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          idempotency_key?: string;
          order_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checkout_attempts_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkout_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          recipient_name: string;
          phone: string;
          address_line: string;
          area: string;
          notes: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          recipient_name: string;
          phone: string;
          address_line: string;
          area: string;
          notes?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          recipient_name?: string;
          phone?: string;
          address_line?: string;
          area?: string;
          notes?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          sku: string | null;
          unit_price_minor: number;
          quantity: number;
          line_total_minor: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          sku?: string | null;
          unit_price_minor: number;
          quantity: number;
          line_total_minor: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          sku?: string | null;
          unit_price_minor?: number;
          quantity?: number;
          line_total_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_statuses: {
        Row: {
          id: number;
          code: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          id: number;
          code: string;
          name: string;
          sort_order: number;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status_id: number;
          recipient_name: string;
          phone: string;
          delivery_address: string;
          delivery_notes: string | null;
          subtotal_minor: number;
          delivery_fee_minor: number;
          total_minor: number;
          currency: string;
          payment_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          status_id: number;
          recipient_name: string;
          phone: string;
          delivery_address: string;
          delivery_notes?: string | null;
          subtotal_minor: number;
          delivery_fee_minor: number;
          total_minor: number;
          currency: string;
          payment_method: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          status_id?: number;
          recipient_name?: string;
          phone?: string;
          delivery_address?: string;
          delivery_notes?: string | null;
          subtotal_minor?: number;
          delivery_fee_minor?: number;
          total_minor?: number;
          currency?: string;
          payment_method?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_status_id_fkey";
            columns: ["status_id"];
            isOneToOne: false;
            referencedRelation: "order_statuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          sku: string | null;
          price_minor: number;
          currency: string;
          stock_quantity: number;
          image_path: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          sku?: string | null;
          price_minor: number;
          currency: string;
          stock_quantity?: number;
          image_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sku?: string | null;
          price_minor?: number;
          currency?: string;
          stock_quantity?: number;
          image_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          role_id: number;
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id: number;
          full_name?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: number;
          full_name?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "app_roles";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          id: number;
          store_name: string;
          contact_phone: string | null;
          contact_email: string | null;
          currency: string;
          delivery_fee_minor: number;
          minimum_order_minor: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name: string;
          contact_phone?: string | null;
          contact_email?: string | null;
          currency: string;
          delivery_fee_minor: number;
          minimum_order_minor: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          store_name?: string;
          contact_phone?: string | null;
          contact_email?: string | null;
          currency?: string;
          delivery_fee_minor?: number;
          minimum_order_minor?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      place_cod_order: {
        Args: {
          p_idempotency_key: string;
          p_items: {
            product_id: string;
            quantity: number;
          }[];
          p_address_id?: string | null;
          p_address?: {
            recipient_name: string;
            phone: string;
            address_line: string;
            area: string;
            notes?: string | null;
          } | null;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicTable = keyof Database["public"]["Tables"];
export type TableRow<T extends PublicTable> = Database["public"]["Tables"][T]["Row"];

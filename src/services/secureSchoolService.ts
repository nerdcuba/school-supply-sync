
import { supabase } from '@/integrations/supabase/client';
import { adminAuthService } from './adminAuthService';
import { sanitizeInput, validationSchemas } from '@/utils/inputValidation';

export interface SecureSchool {
  id?: string;
  name: string;
  address: string;
  phone: string;
  principal?: string;
  website?: string;
  grades?: string;
  enrollment?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const secureSchoolService = {
  // Public method - no admin check needed
  async getActiveSchools(): Promise<SecureSchool[]> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active schools:', error);
      throw error;
    }

    return data || [];
  },

  // Admin only methods with proper authorization
  async getAllSchools(): Promise<SecureSchool[]> {
    return adminAuthService.executeAdminOperation(async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching all schools:', error);
        throw error;
      }

      return data || [];
    }, 'getAllSchools');
  },

  async createSchool(schoolData: Omit<SecureSchool, 'id'>): Promise<SecureSchool> {
    return adminAuthService.executeAdminOperation(async () => {
      // Validate input
      const validatedData = validationSchemas.school.parse(schoolData);
      
      // Sanitize input
      const sanitizedData = {
        ...validatedData,
        name: sanitizeInput.sanitizeString(validatedData.name),
        address: sanitizeInput.sanitizeString(validatedData.address),
        phone: sanitizeInput.sanitizePhone(validatedData.phone),
        principal: validatedData.principal ? sanitizeInput.sanitizeString(validatedData.principal) : undefined,
        website: validatedData.website ? sanitizeInput.sanitizeUrl(validatedData.website) : undefined,
        grades: validatedData.grades ? sanitizeInput.sanitizeString(validatedData.grades) : undefined
      };

      const { data, error } = await supabase
        .from('schools')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        console.error('Error creating school:', error);
        throw error;
      }

      console.log('✅ School created successfully:', data.name);
      return data;
    }, 'createSchool');
  },

  async updateSchool(id: string, updates: Partial<SecureSchool>): Promise<SecureSchool> {
    return adminAuthService.executeAdminOperation(async () => {
      // Validate input using partial schema
      const partialSchema = validationSchemas.school.partial();
      const validatedData = partialSchema.parse(updates);
      
      // Sanitize input
      const sanitizedData: Partial<SecureSchool> = {};
      if (validatedData.name) sanitizedData.name = sanitizeInput.sanitizeString(validatedData.name);
      if (validatedData.address) sanitizedData.address = sanitizeInput.sanitizeString(validatedData.address);
      if (validatedData.phone) sanitizedData.phone = sanitizeInput.sanitizePhone(validatedData.phone);
      if (validatedData.principal) sanitizedData.principal = sanitizeInput.sanitizeString(validatedData.principal);
      if (validatedData.website) sanitizedData.website = sanitizeInput.sanitizeUrl(validatedData.website);
      if (validatedData.grades) sanitizedData.grades = sanitizeInput.sanitizeString(validatedData.grades);
      if (validatedData.enrollment !== undefined) sanitizedData.enrollment = validatedData.enrollment;
      if (updates.is_active !== undefined) sanitizedData.is_active = updates.is_active;

      const { data, error } = await supabase
        .from('schools')
        .update({ ...sanitizedData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating school:', error);
        throw error;
      }

      console.log('✅ School updated successfully:', data.name);
      return data;
    }, 'updateSchool');
  },

  async deleteSchool(id: string): Promise<void> {
    return adminAuthService.executeAdminOperation(async () => {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting school:', error);
        throw error;
      }

      console.log('✅ School deleted successfully');
    }, 'deleteSchool');
  }
};

<Select
  value={formData.status}
  onValueChange={(value: string) => handleSelectChange('status', value)}
> 
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Operational">Operational</SelectItem>
    <SelectItem value="Maintenance">Maintenance</SelectItem>
    <SelectItem value="Out of Service">Out of Service</SelectItem>
  </SelectContent>
</Select> 
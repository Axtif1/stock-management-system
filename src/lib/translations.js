/**
 * Minimal Translation Dictionary: English & Natural Roman-script Hinglish
 * Focused strictly on Box-based stock movement (Maal Aaya, Maal Diya, Stock).
 */

export const translations = {
  en: {
    // 4 Main Navigation
    nav_dashboard: 'Dashboard',
    nav_stock_in: 'Stock In',
    nav_stock_out: 'Stock Out',
    nav_inventory: 'Inventory',
    nav_settings: 'Settings',

    // Stock Terms
    box_unit: 'BOX',
    boxes_received: 'Boxes Received',
    boxes_given: 'Boxes Given',
    remaining_boxes: 'Remaining Boxes',
    total_received: 'Total Received',
    total_given: 'Total Given',
    remaining: 'Remaining',

    // Dashboard
    dash_title: 'Stock Overview',
    dash_total_remaining_stock: 'Total Remaining Stock',
    dash_total_stock_given: 'Total Stock Given',
    dash_btn_maal_aaya: '+ Stock In (Maal Aaya)',
    dash_btn_maal_diya: '− Stock Out (Maal Diya)',
    dash_eod_btn: 'Daily Summary Report',

    // Stock In (Maal Aaya)
    in_title: 'Stock In — Maal Aaya',
    in_select_product: 'Product Name',
    in_new_product_placeholder: 'Type cold drink name (e.g. Limca 250ml)...',
    in_boxes_label: 'Number of BOX Received',
    in_save_btn: 'Save Stock In',
    in_recent_title: 'Recent Incoming Entries',
    in_add_new_toggle: '+ Add New Item',
    in_select_existing_toggle: '← Select From List',
    in_success: 'Stock in saved successfully!',

    // Stock Out (Maal Diya)
    out_title: 'Stock Out — Maal Diya',
    out_select_product: 'Product Name',
    out_available: 'Available in Warehouse',
    out_boxes_label: 'Number of BOX Given Out',
    out_remaining_after: 'Remaining After Entry',
    out_save_btn: 'Save Entry',
    out_recent_title: 'Recent Outgoing Entries',
    out_error_exceeds: 'Cannot give more than available stock!',
    out_error_zero: 'Enter at least 1 box',
    out_success: 'Stock out saved successfully!',

    // Inventory
    inv_title: 'Warehouse Inventory',
    inv_search_placeholder: 'Search product...',
    inv_col_name: 'Product',
    inv_col_received: 'Total Received',
    inv_col_given: 'Total Given',
    inv_col_remaining: 'Remaining',
    inv_add_btn: '+ Add Product',
    inv_edit: 'Edit',
    inv_delete: 'Delete',
    inv_delete_confirm_title: 'Delete Product',
    inv_delete_confirm_msg: 'Are you sure you want to delete this product?',
    inv_delete_warning: 'Warning: This product still has {count} BOX remaining in stock!',
    inv_deleted_success: 'Product deleted successfully',

    // Simple EOD Report
    eod_title: 'Daily Summary Report',
    eod_date: 'Date',
    eod_print: 'Print Report',
    eod_col_product: 'Product Name',
    eod_col_received_today: 'Received Today',
    eod_col_given_today: 'Given Today',
    eod_col_remaining: 'Closing Stock',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    reset_demo: 'Reset Demo',
    reset_confirm: 'Reset stock to default numbers?',
  },

  hi: {
    // 4 Main Navigation
    nav_dashboard: 'Dashboard',
    nav_stock_in: 'Maal Aaya',
    nav_stock_out: 'Maal Diya',
    nav_inventory: 'Stock Dekhein',
    nav_settings: 'Settings',

    // Stock Terms
    box_unit: 'BOX',
    boxes_received: 'Kitne BOX Aaye',
    boxes_given: 'Kitne BOX Diye',
    remaining_boxes: 'Kitne BOX Bache',
    total_received: 'Total Aaye',
    total_given: 'Total Diye',
    remaining: 'Bache',

    // Dashboard
    dash_title: 'Stock Ka Hisab',
    dash_total_remaining_stock: 'Total Stock Bacha Hai',
    dash_total_stock_given: 'Total Stock Diya Hai',
    dash_btn_maal_aaya: '+ Maal Aaya',
    dash_btn_maal_diya: '− Maal Diya',
    dash_eod_btn: 'Aaj Ka Din Bhar Ka Hisab',

    // Stock In (Maal Aaya)
    in_title: 'Maal Aaya (Stock In)',
    in_select_product: 'Cold Drink Ka Naam',
    in_new_product_placeholder: 'Nayi cold drink ka naam likhein...',
    in_boxes_label: 'Kitne BOX Aaye',
    in_save_btn: 'Save Maal Aaya',
    in_recent_title: 'Haal Me Aaye BOX',
    in_add_new_toggle: '+ Naya Item Likhein',
    in_select_existing_toggle: '← List Me Se Chunein',
    in_success: 'Maal Aaya entry save ho gayi!',

    // Stock Out (Maal Diya)
    out_title: 'Maal Diya (Stock Out)',
    out_select_product: 'Cold Drink Ka Naam',
    out_available: 'Godown Me Bacha Hai',
    out_boxes_label: 'Kitne BOX Diye',
    out_remaining_after: 'Entry Ke Baad Bachenge',
    out_save_btn: 'Entry Save Karein',
    out_recent_title: 'Haal Me Diye BOX',
    out_error_exceeds: 'Stock me itne BOX nahi hain!',
    out_error_zero: 'Kam se kam 1 BOX dalein',
    out_success: 'Maal Diya entry save ho gayi!',

    // Inventory
    inv_title: 'Warehouse Stock',
    inv_search_placeholder: 'Cold drink search karein...',
    inv_col_name: 'Cold Drink',
    inv_col_received: 'Total Aaye',
    inv_col_given: 'Total Diye',
    inv_col_remaining: 'Bache BOX',
    inv_add_btn: '+ Nayi Cold Drink',
    inv_edit: 'Badlein',
    inv_delete: 'Hatayein',
    inv_delete_confirm_title: 'Product Hatayein',
    inv_delete_confirm_msg: 'Kya aap sach me is cold drink ko hatana chahte hain?',
    inv_delete_warning: 'Dhyan dein: Is cold drink ke abhi bhi {count} BOX stock me bache hain!',
    inv_deleted_success: 'Product hata diya gaya',

    // Simple EOD Report
    eod_title: 'Aaj Ka Din Bhar Ka Hisab',
    eod_date: 'Taarikh',
    eod_print: 'Print Karein',
    eod_col_product: 'Cold Drink Ka Naam',
    eod_col_received_today: 'Aaj Aaye',
    eod_col_given_today: 'Aaj Diye',
    eod_col_remaining: 'Bacha Stock',

    // Common
    save: 'Save Karein',
    cancel: 'Cancel Karein',
    search: 'Search Karein',
    reset_demo: 'Reset Karein',
    reset_confirm: 'Kya stock wapas shuruwat jaisa karna hai?',
  },
};

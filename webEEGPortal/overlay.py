#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Dec  6 17:48:09 2018

@author: carlos
"""

def image_load(plane_moving,drag_list,roi_list,roi_map):
     
    for num in drag_list:
        num = int(num)
        background_plane = Image.open(f'{low_res_path}/ROI_{plane_moving}/roi_brain_{plane_moving}_{num}.png')
        overlayed_plane = Image.new('RGBA', background_plane.size, (0, 0, 0, 0))
        overlayed_plane.paste(background_plane,(0,0))

        for roi_area in roi_list:
            roi_area = str(roi_area)
            if roi_area in roi_map:
                plane_roi = Image.open(f'{low_res_path}/ROI_{plane_moving}/roi_{roi_area}_{plane_moving}_{num}.png')        
                overlayed_plane.paste(plane_roi,(0,0), mask = plane_roi)

        overlayed_plane.save(f'{low_res_path}/Overlay_Movement/overlay_{plane_moving}_{num}.png')

if __name__ == "__main__":
    
    from PIL import Image
    import numpy as np
    
    subject_path ='/data/Synology_Scans/Processing/Ants/42680f5078a7b9605de7f3c22f2d731b/T1'
    each_proc = '42680f5078a7b9605de7f3c22f2d731b'
    rois_path = f"{subject_path}/ROIs"
    low_res_path = f'{subject_path}/2D_ROIs_Overlay'
    
    # Coordinate or coordinate lists
    x_drag = np.linspace(121,130,10)
    y_drag = np.linspace(141,150,10)
    current_plane = 'sagittal'
    # Checkboxes
    roi_list = [17,1006,53]
    roi_map = {'17':'Left_Hippocampus',
               '53':'Right_Hippocampus',
               '1006':'Left_Enthorinal_Cortex',
               '2006':'Right_Enthorinal_Cortex'}
    
    
    
    if current_plane == 'sagittal':      
        planes_moving = ['axial','coronal']
    if current_plane == 'coronal':      
        planes_moving = ['axial','sagittal']
    if current_plane == 'axial':      
        planes_moving = ['sagittal','coronal']        
    
    image_load(planes_moving[0],x_drag,roi_list,roi_map)
    image_load(planes_moving[1],y_drag,roi_list,roi_map)        
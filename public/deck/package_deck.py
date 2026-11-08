import sys
import os
from pathlib import Path
import yaml
from pptx import Presentation
from pptx.util import Inches

def package_pptx(spec_path: str, output_pptx: str):
    spec = yaml.safe_load(Path(spec_path).read_text(encoding='utf-8'))
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    for slide_info in spec.get('slides', []):
        img_rel = slide_info.get('output')
        img_path = Path(spec_path).parent.parent / img_rel if not Path(img_rel).is_absolute() else Path(img_rel)
        if not img_path.exists():
            print(f"Warning: image {img_path} does not exist, skipping.")
            continue
        
        slide = prs.slides.add_slide(blank_layout)
        slide.shapes.add_picture(str(img_path), Inches(0), Inches(0), width=prs.slide_width, height=prs.slide_height)
        print(f"Added {img_path.name} to PPTX")

    prs.save(output_pptx)
    print(f"Successfully generated presentation at {output_pptx}")

if __name__ == '__main__':
    base_dir = Path(__file__).parent
    spec_file = base_dir / 'spec.yaml'
    pptx_file = base_dir / 'patreport_intro.pptx'
    package_pptx(str(spec_file), str(pptx_file))

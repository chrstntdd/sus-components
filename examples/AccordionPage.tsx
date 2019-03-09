import * as React from 'react'

import { Accordion, Fold } from '../lib'

const Content = () => {
  return (
    <div className="accordion-content">
      Lorem ipsum dolor amet cred hoodie aesthetic banjo, heirloom organic health goth viral
      try-hard pinterest hexagon occupy cronut art party pickled. Before they sold out VHS drinking
      vinegar, church-key hoodie viral gluten-free vice locavore tacos microdosing kitsch keffiyeh.
      Offal mlkshk lo-fi master cleanse, lyft iceland snackwave cred street art. Tote bag yuccie
      pour-over tacos offal, blog lyft selfies knausgaard taxidermy twee DIY woke affogato cardigan.
      Celiac lomo tilde, cold-pressed coloring book schlitz tote bag banjo. 90's tofu master cleanse
      thundercats, banh mi wayfarers YOLO actually tumblr drinking vinegar narwhal salvia health
      goth. Before they sold out pork belly austin, readymade direct trade pitchfork fam green
      juice. Edison bulb la croix cold-pressed kickstarter, dreamcatcher tattooed tacos roof party.
      Four dollar toast ramps green juice pop-up. Letterpress offal farm-to-table enamel pin hoodie
      master cleanse banjo. Gluten-free yr banjo vexillologist occupy cronut cred. Godard swag af
      bitters ennui. Bicycle rights etsy vegan, la croix +1 synth air plant chia fashion axe
      wayfarers poke actually. Iceland asymmetrical flannel 8-bit gentrify selfies marfa
      single-origin coffee poutine skateboard sartorial. Fashion axe roof party farm-to-table
      disrupt hashtag gentrify sartorial. Bicycle rights iPhone roof party aesthetic literally
      dreamcatcher poke williamsburg microdosing man braid fam taiyaki narwhal fingerstache pickled.
      Hell of forage lumbersexual, godard truffaut man braid try-hard swag bicycle rights occupy
      franzen mustache pitchfork. Hella meggings flannel bicycle rights. Wayfarers raw denim lomo,
      chia umami vegan wolf shabby chic vape flexitarian pug trust fund pabst cardigan fashion axe.
      Truffaut jianbing unicorn thundercats raclette umami pug paleo. Sriracha small batch cronut
      post-ironic viral adaptogen butcher cloud bread. Cred VHS direct trade 90's, pork belly cloud
      bread hella kale chips pok pok helvetica glossier. Ramps enamel pin art party, squid godard yr
      street art typewriter palo santo prism helvetica. Chicharrones bespoke cold-pressed humblebrag
      echo park blog intelligentsia knausgaard migas pok pok meditation succulents crucifix keytar
      pabst. Poutine trust fund knausgaard raclette, kinfolk schlitz cornhole migas gochujang
      hammock food truck kogi. Tumeric migas pour-over poutine copper mug slow-carb XOXO. Poutine
      banjo gastropub fanny pack literally, hella forage gochujang umami iPhone cold-pressed next
      level selvage. Distillery vexillologist hell of 8-bit lyft irony. Bicycle rights glossier
      skateboard la croix edison bulb affogato. Coloring book cray sartorial viral hexagon. Pickled
      poutine mlkshk flexitarian bespoke, iceland kitsch helvetica ethical fam crucifix banjo 3 wolf
      moon jianbing hot chicken. Woke actually small batch schlitz slow-carb.
    </div>
  )
}

const AccordionPage = () => {
  return (
    <div className="accordion-page">
      <Accordion>
        <Fold label="Item A" id="a" sectionId="a">
          <Content />
        </Fold>
        <Fold label="Item B" id="b" sectionId="b">
          <Content />
        </Fold>
        <Fold label="Item C" id="c" sectionId="c">
          <Content />
        </Fold>
        <Fold label="Item D" id="d" sectionId="d">
          <Content />
        </Fold>
      </Accordion>
    </div>
  )
}

export default AccordionPage
